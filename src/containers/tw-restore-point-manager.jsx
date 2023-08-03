import React from 'react';
import {connect} from 'react-redux';
import {intlShape, injectIntl, defineMessages} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {showAlertWithTimeout, showStandardAlert} from '../reducers/alerts';
import {closeLoadingProject, closeRestorePointModal, openLoadingProject} from '../reducers/modals';
import {LoadingStates, getIsShowingProject, onLoadedProject, requestProjectUpload} from '../reducers/project-state';
import {setFileHandle} from '../reducers/tw';
import TWRestorePointModal from '../components/tw-restore-point-modal/restore-point-modal.jsx';
import RestorePointAPI from '../lib/tw-restore-point-api';
import log from '../lib/log';
import AddonHooks from '../addons/hooks';

/* eslint-disable no-alert */

const AUTOMATIC_INTERVAL = 1000 * 5; // TODO: increase this when testing is done
const SAVE_DELAY = 250;
const MINIMUM_SAVE_TIME = 750;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const messages = defineMessages({
    confirmLoad: {
        defaultMessage: 'You have unsaved changes. Replace existing project?',
        description: 'Confirmation that appears when loading a restore point to confirm overwriting unsaved changes.',
        id: 'tw.restorePoints.confirmLoad'
    },
    confirmDelete: {
        defaultMessage: 'Are you sure you want to delete "{projectTitle}"? This cannot be undone.',
        description: 'Confirmation that appears when deleting a restore poinnt',
        id: 'tw.restorePoints.confirmDelete'
    },
    confirmDeleteAll: {
        defaultMessage: 'Are you sure you want to delete ALL restore points? This cannot be undone.',
        description: 'Confirmation that appears when deleting ALL restore points.',
        id: 'tw.restorePoints.confirmDeleteAll'
    }
});

class TWRestorePointManager extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickCreate',
            'handleClickDelete',
            'handleClickDeleteAll',
            'handleClickLoad',
            'handleClickLoadLegacy'
        ]);
        this.state = {
            loading: true,
            totalSize: 0,
            restorePoints: [],
            error: null
        };
        this.timeout = null;
    }

    componentDidMount () {
        if (this.shouldBeAutosaving()) {
            this.queueRestorePoint();
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.isModalVisible && !this.props.isModalVisible) {
            this.refreshState();
        } else if (!nextProps.isModalVisible && this.props.isModalVisible) {
            this.setState({
                restorePoints: []
            });
        }
    }

    componentDidUpdate (prevProps) {
        if (
            this.props.projectChanged !== prevProps.projectChanged ||
            this.props.isShowingProject !== prevProps.isShowingProject
        ) {
            if (this.shouldBeAutosaving()) {
                // Project was modified
                this.queueRestorePoint();
            } else {
                // Project was saved
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
    }

    componentWillUnmount () {
        clearTimeout(this.timeout);
        this.timeout = null;
    }

    shouldBeAutosaving () {
        return this.props.projectChanged && this.props.isShowingProject;
    }

    isDisabled () {
        return AddonHooks.disableRestorePoints;
    }

    handleClickCreate () {
        this.createRestorePoint(RestorePointAPI.TYPE_MANUAL)
            .catch(error => {
                this.handleModalError(error);
            });
    }

    handleClickDelete (id) {
        const projectTitle = this.state.restorePoints.find(i => i.id === id).title;
        if (!confirm(this.props.intl.formatMessage(messages.confirmDelete, {projectTitle}))) {
            return;
        }

        this.setState({
            loading: true
        });
        RestorePointAPI.deleteRestorePoint(id)
            .then(() => {
                this.refreshState();
            })
            .catch(error => {
                this.handleModalError(error);
            });
    }

    handleClickDeleteAll () {
        if (!confirm(this.props.intl.formatMessage(messages.confirmDeleteAll))) {
            return;
        }

        this.setState({
            loading: true
        });
        RestorePointAPI.deleteAllRestorePoints()
            .then(() => {
                this.refreshState();
            })
            .catch(error => {
                this.handleModalError(error);
            });
    }

    _startLoading () {
        this.props.onCloseModal();
        this.props.onStartLoadingRestorePoint(this.props.loadingState);
    }

    _finishLoading (success) {
        setTimeout(() => {
            this.props.vm.renderer.draw();
        });
        this.props.onFinishLoadingRestorePoint(success, this.props.loadingState);
    }

    canLoadProject () {
        if (!this.props.isShowingProject) {
            // Loading a project now will break the state machine
            return false;
        }
        if (this.props.projectChanged && !confirm(this.props.intl.formatMessage(messages.confirmLoad))) {
            return false;
        }
        return true;
    }

    handleClickLoad (id) {
        if (!this.canLoadProject()) {
            return;
        }
        this._startLoading();
        RestorePointAPI.loadRestorePoint(this.props.vm, id)
            .then(() => {
                this._finishLoading(true);
            })
            .catch(error => {
                this.handleModalError(error);
                this._finishLoading(false);
            });
    }

    handleClickLoadLegacy () {
        if (!this.canLoadProject()) {
            return;
        }
        this._startLoading();
        RestorePointAPI.loadLegacyRestorePoint()
            .then(buffer => this.props.vm.loadProject(buffer))
            .then(() => {
                this._finishLoading(true);
            })
            .catch(error => {
                // Don't handleError on this because we're expecting error 90% of the time
                alert(error);
                this._finishLoading(false);
            });
    }

    queueRestorePoint () {
        if (this.timeout) {
            return;
        }
        this.timeout = setTimeout(() => {
            this.createRestorePoint(RestorePointAPI.TYPE_AUTOMATIC).then(() => {
                this.timeout = null;

                if (this.shouldBeAutosaving()) {
                    // Project is still not saved
                    this.queueRestorePoint();
                }
            });
        }, AUTOMATIC_INTERVAL);
    }

    createRestorePoint (type) {
        if (this.isDisabled()) {
            return Promise.reject(new Error('Disabled'));
        }

        if (this.props.isModalVisible) {
            this.setState({
                loading: true
            });
        }

        this.props.onStartCreatingRestorePoint();
        return Promise.all([
            // Wait a little bit before saving so UI can update before saving, which can cause stutter
            sleep(SAVE_DELAY)
                .then(() => RestorePointAPI.createRestorePoint(this.props.vm, this.props.projectTitle, type))
                .then(() => RestorePointAPI.removeExtraneousRestorePoints()),

            // Force saves to not be instant so people can see that we're making a restore point
            // It also makes refreshes less likely to cause accidental clicks in the modal
            sleep(MINIMUM_SAVE_TIME)
        ])
            .then(() => {
                if (this.props.isModalVisible) {
                    this.refreshState();
                }

                this.props.onFinishCreatingRestorePoint();
            });
    }

    refreshState () {
        this.setState({
            loading: true,
            error: null,
            restorePoints: []
        });
        RestorePointAPI.getAllRestorePoints()
            .then(data => {
                this.setState({
                    loading: false,
                    totalSize: data.totalSize,
                    restorePoints: data.restorePoints
                });
            })
            .catch(error => {
                this.handleModalError(error);
            });
    }

    handleModalError (error) {
        log.error('Restore point error', error);
        this.setState({
            error: `${error}`
        });
    }

    render () {
        if (this.props.isModalVisible) {
            return (
                <TWRestorePointModal
                    onClose={this.props.onCloseModal}
                    onClickCreate={this.handleClickCreate}
                    onClickDelete={this.handleClickDelete}
                    onClickDeleteAll={this.handleClickDeleteAll}
                    onClickLoad={this.handleClickLoad}
                    onClickLoadLegacy={this.handleClickLoadLegacy}
                    disabled={this.isDisabled()}
                    isLoading={this.state.loading}
                    totalSize={this.state.totalSize}
                    restorePoints={this.state.restorePoints}
                    error={this.state.error}
                />
            );
        }
        return null;
    }
}

TWRestorePointManager.propTypes = {
    intl: intlShape,
    projectChanged: PropTypes.bool.isRequired,
    projectTitle: PropTypes.string.isRequired,
    onStartCreatingRestorePoint: PropTypes.func.isRequired,
    onFinishCreatingRestorePoint: PropTypes.func.isRequired,
    onStartLoadingRestorePoint: PropTypes.func.isRequired,
    onFinishLoadingRestorePoint: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired,
    loadingState: PropTypes.oneOf(LoadingStates).isRequired,
    isShowingProject: PropTypes.bool.isRequired,
    isModalVisible: PropTypes.bool.isRequired,
    vm: PropTypes.shape({
        loadProject: PropTypes.func.isRequired,
        renderer: PropTypes.shape({
            draw: PropTypes.func.isRequired
        }).isRequired
    }).isRequired
};

const mapStateToProps = state => ({
    projectChanged: state.scratchGui.projectChanged,
    projectTitle: state.scratchGui.projectTitle,
    loadingState: state.scratchGui.projectState.loadingState,
    isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
    isModalVisible: state.scratchGui.modals.restorePointModal,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onStartCreatingRestorePoint: () => dispatch(showStandardAlert('twCreatingRestorePoint')),
    onFinishCreatingRestorePoint: () => showAlertWithTimeout(dispatch, 'twRestorePointSuccess'),
    onStartLoadingRestorePoint: loadingState => {
        dispatch(openLoadingProject());
        dispatch(requestProjectUpload(loadingState));
    },
    onFinishLoadingRestorePoint: (success, loadingState) => {
        dispatch(onLoadedProject(loadingState, false, success));
        dispatch(closeLoadingProject());
        dispatch(setFileHandle(null));
    },
    onCloseModal: () => dispatch(closeRestorePointModal())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(TWRestorePointManager));

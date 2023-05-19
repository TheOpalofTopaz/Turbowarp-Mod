import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import log from '../lib/log';
import CustomExtensionModalComponent from '../components/tw-custom-extension-modal/custom-extension-modal.jsx';
import {closeCustomExtensionModal} from '../reducers/modals';
import {manuallyTrustExtension, isTrustedExtension} from './tw-security-manager.jsx';

class CustomExtensionModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeFile',
            'handleChangeURL',
            'handleClose',
            'handleKeyDown',
            'handleLoadExtension',
            'handleSwitchToFile',
            'handleSwitchToURL',
            'handleSwitchToText',
            'handleChangeText',
            'handleDragOver',
            'handleDragLeave',
            'handleDrop',
            'handleChangeForceSandboxed'
        ]);
        this.state = {
            files: null,
            type: 'url',
            url: '',
            file: null,
            text: '',
            forceUnsandboxed: false
        };
    }
    getExtensionURL () {
        if (this.state.type === 'url') {
            return this.state.url;
        }
        if (this.state.type === 'file') {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Could not read extension as data URL'));
                reader.readAsDataURL(this.state.file);
            });
        }
        if (this.state.type === 'text') {
            return `data:application/javascript,${encodeURIComponent(this.state.text)}`;
        }
        return Promise.reject(new Error('Unknown type'));
    }
    hasValidInput () {
        if (this.state.type === 'url') {
            return !!this.state.url;
        }
        if (this.state.type === 'file') {
            return !!this.state.file;
        }
        if (this.state.type === 'text') {
            return !!this.state.text;
        }
        return false;
    }
    handleChangeFile (file) {
        this.setState({
            file
        });
    }
    handleChangeURL (e) {
        this.setState({
            url: e.target.value
        });
    }
    handleClose () {
        this.props.onClose();
    }
    handleKeyDown (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLoadExtension();
        }
    }
    async handleLoadExtension () {
        this.handleClose();
        try {
            const url = await this.getExtensionURL();
            if (this.state.forceUnsandboxed) {
                manuallyTrustExtension(url);
            }
            await this.props.vm.extensionManager.loadExtensionURL(url);
        } catch (err) {
            log.error(err);
            // eslint-disable-next-line no-alert
            alert(err);
        }
    }
    handleSwitchToFile () {
        this.setState({
            type: 'file'
        });
    }
    handleSwitchToURL () {
        this.setState({
            type: 'url'
        });
    }
    handleSwitchToText () {
        this.setState({
            type: 'text'
        });
    }
    handleChangeText (e) {
        this.setState({
            text: e.target.value
        });
    }
    handleDragOver (e) {
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    }
    handleDragLeave () {

    }
    handleDrop (e) {
        const file = e.dataTransfer.files[0];
        if (file) {
            e.preventDefault();
            this.setState({
                type: 'file',
                file
            });
        }
    }
    handleChangeForceSandboxed (e) {
        this.setState({
            forceUnsandboxed: e.target.checked
        });
    }
    isUnsandboxedByDefault () {
        if (this.state.type === 'url') {
            return isTrustedExtension(this.state.url);
        }
        return false;
    }
    render () {
        return (
            <CustomExtensionModalComponent
                canLoadExtension={this.hasValidInput()}
                type={this.state.type}
                onSwitchToFile={this.handleSwitchToFile}
                onSwitchToURL={this.handleSwitchToURL}
                onSwitchToText={this.handleSwitchToText}
                file={this.state.file}
                onChangeFile={this.handleChangeFile}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                url={this.state.url}
                onChangeURL={this.handleChangeURL}
                onKeyDown={this.handleKeyDown}
                text={this.state.text}
                onChangeText={this.handleChangeText}
                defaultUnsandboxed={this.isUnsandboxedByDefault()}
                forceUnsandboxed={this.state.forceUnsandboxed}
                onChangeForceUnsandboxed={this.handleChangeForceSandboxed}
                onLoadExtension={this.handleLoadExtension}
                onClose={this.handleClose}
            />
        );
    }
}

CustomExtensionModal.propTypes = {
    onClose: PropTypes.func,
    vm: PropTypes.shape({
        extensionManager: PropTypes.shape({
            loadExtensionURL: PropTypes.func
        })
    })
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomExtensionModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomExtensionModal);

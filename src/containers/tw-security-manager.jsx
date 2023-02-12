import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import log from '../lib/log';
import bindAll from 'lodash.bindall';
import SecurityManagerModal from '../components/tw-security-manager-modal/security-manager-modal.jsx';
import SecurityModals from '../lib/tw-security-manager-constants';

// Extensions that start with these URLs will be loaded automatically and without a sandbox.
// Be careful adding entries. Be sure to incldue the trailing / in your checks.
const isTrustedExtension = url => (
    url.startsWith('https://extensions.turbowarp.org/') ||

    // For development.
    url.startsWith('http://localhost:8000/')
);

// List of origins that have been allowed by the user.
const allowedFetchOrigins = [];

/**
 * @param {string} url Original URL string
 * @returns {URL|null} A URL object if it is valid and of a known protocol, otherwise null.
 */
const parseURL = url => {
    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        return null;
    }
    const protocols = ['http:', 'https:', 'ws:', 'wss:', 'data:', 'blob:'];
    if (!protocols.includes(parsed.protocol)) {
        return null;
    }
    return parsed;
};

class TWSecurityManagerComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getSandboxMode',
            'canLoadExtensionFromProject',
            'canFetch',
            'canOpenWindow',
            'canRedirect',
            'handleAllowed',
            'handleDenied'
        ]);
        this.nextModalCallbacks = [];
        this.modalLocked = false;
        this.state = {
            modal: null
        };
    }

    componentDidMount () {
        const securityManager = this.props.vm.extensionManager.securityManager;
        securityManager.getSandboxMode = this.getSandboxMode;
        securityManager.canLoadExtensionFromProject = this.canLoadExtensionFromProject;
        securityManager.canFetch = this.canFetch;
        securityManager.canOpenWindow = this.canOpenWindow;
        securityManager.canRedirect = this.canRedirect;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @returns {Promise<() => Promise<boolean>>} Resolves with a function that you can call to show the modal.
     * The resolved function returns a promise that resolves with true if the request was approved.
     */
    async acquireModalLock () {
        // We need a two-step process for showing a modal so that we don't overwrite or overlap modals,
        // and so that multiple attempts to fetch resources from the same origin will all be allowed
        // with just one click. This means that some places have to wait until previous modals are
        // closed before it knows if it needs to display another modal.

        if (this.modalLocked) {
            await new Promise(resolve => {
                this.nextModalCallbacks.push(resolve);
            });
        } else {
            this.modalLocked = true;
        }

        const releaseLock = () => {
            if (this.nextModalCallbacks.length) {
                const nextModalCallback = this.nextModalCallbacks.shift();
                nextModalCallback();
            } else {
                this.modalLocked = false;
                this.setState({
                    modal: null
                });
            }
        };

        const showModal = async data => {
            const result = await new Promise(resolve => {
                this.setState({
                    modal: {
                        ...data,
                        callback: resolve
                    }
                });
            });
            releaseLock();
            return result;
        };

        return {
            showModal,
            releaseLock
        };
    }

    handleAllowed () {
        this.state.modal.callback(true);
    }

    handleDenied () {
        this.state.modal.callback(false);
    }

    /**
     * @param {string} url The extension's URL
     * @returns {string} The VM worker mode to use
     */
    getSandboxMode (url) {
        if (isTrustedExtension(url)) {
            log.info(`Loading extension ${url} unsandboxed`);
            return 'unsandboxed';
        }
        return 'iframe';
    }

    /**
     * @param {string} url The extension's URL
     * @returns {Promise<boolean>} Whether the extension can be loaded
     */
    async canLoadExtensionFromProject (url) {
        if (isTrustedExtension(url)) {
            log.info(`Loading extension ${url} automatically`);
            return true;
        }
        const {showModal} = await this.acquireModalLock();
        return showModal({
            type: SecurityModals.LoadExtension,
            url
        });
    }

    /**
     * @param {string} url The resource to fetch
     * @returns {Promise<boolean>} True if the resource is allowed to be fetched
     */
    async canFetch (url) {
        const parsed = parseURL(url);
        if (!parsed) {
            return;
        }
        const {showModal, releaseLock} = await this.acquireModalLock();
        if (allowedFetchOrigins.includes(parsed.origin)) {
            releaseLock();
            return true;
        }
        const allowed = await showModal({
            type: SecurityModals.Fetch,
            url
        });
        if (allowed) {
            allowedFetchOrigins.push(parsed.origin);
        }
        return allowed;
    }

    /**
     * @param {string} url The website to open
     * @returns {Promise<boolean>} True if the website can be opened
     */
    async canOpenWindow (url) {
        const parsed = parseURL(url);
        if (!parsed) {
            return;
        }
        const {showModal} = await this.acquireModalLock();
        return showModal({
            type: SecurityModals.OpenWindow,
            url
        });
    }

    /**
     * @param {string} url The website to redirect to
     * @returns {Promise<boolean>} True if the website can be redirected to
     */
    async canRedirect (url) {
        const parsed = parseURL(url);
        if (!parsed) {
            return;
        }
        const {showModal} = await this.acquireModalLock();
        return showModal({
            type: SecurityModals.Redirect,
            url
        });
    }

    render () {
        if (this.state.modal) {
            const modal = this.state.modal;
            return (
                <SecurityManagerModal
                    type={modal.type}
                    url={modal.url}
                    onAllowed={this.handleAllowed}
                    onDenied={this.handleDenied}
                />
            );
        }
        return null;
    }
}

TWSecurityManagerComponent.propTypes = {
    vm: PropTypes.shape({
        extensionManager: PropTypes.shape({
            securityManager: PropTypes.shape({
                getSandboxMode: PropTypes.func.isRequired,
                canLoadExtensionFromProject: PropTypes.func.isRequired,
                canFetch: PropTypes.func.isRequired,
                canOpenWindow: PropTypes.func.isRequired,
                canRedirect: PropTypes.func.isRequired
            }).isRequired
        }).isRequired
    }).isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWSecurityManagerComponent);

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
        this.state = {
            modals: []
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

    /**
     * @param {unknown} data Data to give to the modal component.
     * @returns {Promise<boolean>} True if the request was allowed
     */
    queueModal (data) {
        return new Promise(resolve => {
            this.setState(oldState => ({
                modals: [...oldState.modals, {
                    data,
                    callback: resolve
                }]
            }));
        });
    }

    finishModal (result) {
        const firstModal = this.state.modals[0];
        firstModal.callback(result);
        this.setState(oldState => ({
            modals: oldState.modals.slice(1)
        }));
    }

    handleAllowed () {
        this.finishModal(true);
    }

    handleDenied () {
        this.finishModal(false);
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
    canLoadExtensionFromProject (url) {
        if (isTrustedExtension(url)) {
            log.info(`Loading extension ${url} automatically`);
            return true;
        }
        return this.queueModal({
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
        if (allowedFetchOrigins.includes(parsed.origin)) {
            return true;
        }
        const allowed = await this.queueModal({
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
    canOpenWindow (url) {
        const parsed = parseURL(url);
        if (!parsed) {
            return;
        }
        return this.queueModal({
            type: SecurityModals.OpenWindow,
            url
        });
    }

    /**
     * @param {string} url The website to redirect to
     * @returns {Promise<boolean>} True if the website can be redirected to
     */
    canRedirect (url) {
        const parsed = parseURL(url);
        if (!parsed) {
            return;
        }
        return this.queueModal({
            type: SecurityModals.Redirect,
            url
        });
    }

    render () {
        if (this.state.modals.length) {
            const modal = this.state.modals[0];
            return (
                <SecurityManagerModal
                    type={modal.data.type}
                    url={modal.data.url}
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

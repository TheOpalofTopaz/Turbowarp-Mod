import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './load-extension.css';
import URL from './url.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

/**
 * @param {string} dataURI data: URI
 * @returns {string} A hopefully human-readable version
 */
const decodeDataURI = dataURI => {
    const delimeter = dataURI.indexOf(',');
    if (delimeter === -1) {
        return dataURI;
    }
    const contentType = dataURI.substring(0, delimeter);
    const data = dataURI.substring(delimeter + 1);
    if (contentType.endsWith(';base64')) {
        try {
            return atob(data);
        } catch (e) {
            return dataURI;
        }
    }
    try {
        return decodeURIComponent(data);
    } catch (e) {
        return dataURI;
    }
};

const LoadExtensionModal = props => (
    <div>
        {props.url.startsWith('data:') ? (
            <React.Fragment>
                <FormattedMessage
                    defaultMessage="The project wants to load a custom extension with the code:"
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.embedded"
                />
                <textarea
                    className={styles.code}
                    value={decodeDataURI(props.url)}
                    readOnly
                />
            </React.Fragment>
        ) : (
            <React.Fragment>
                <FormattedMessage
                    defaultMessage="The project wants to load a custom extension from the URL:"
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.url"
                />
                <URL url={props.url} />
            </React.Fragment>
        )}

        <label className={styles.unsandboxedContainer}>
            <FancyCheckbox
                className={styles.unsandboxedCheckbox}
                checked={props.unsandboxed}
                onChange={props.onChangeUnsandboxed}
            />
            <FormattedMessage
                defaultMessage="Force this extension to run unsandboxed"
                description="Part of modal asking for permission to automatically load custom extension"
                id="tw.loadExtension.unsandboxed"
            />
        </label>
        {props.unsandboxed ? (
            <div className={styles.unsandboxedWarning}>
                <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage="Loading unknown extensions without the sandbox is dangerous. If you are't sure what this means, please disable this option."
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.unsandboxedWarning"
                />
            </div>
        ) : (
            <div className={styles.sandboxed}>
                <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage="While the code will be sandboxed, it will have access to information about your device such as your IP and general location. Make sure you trust the author of this extension before continuing."
                    description="Part of modal asking for permission to automatically load custom extension"
                    id="tw.loadExtension.sandboxed"
                />
            </div>
        )}
    </div>
);

LoadExtensionModal.propTypes = {
    url: PropTypes.string.isRequired,
    unsandboxed: PropTypes.bool.isRequired,
    onChangeUnsandboxed: PropTypes.func.isRequired
};

export default LoadExtensionModal;

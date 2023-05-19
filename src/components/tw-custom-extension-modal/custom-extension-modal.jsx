import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FileInput from './file-input.jsx';
import styles from './custom-extension-modal.css';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Load Custom Extension',
        description: 'Title of custom extension menu',
        id: 'tw.customExtensionModal.title'
    }
});

const CustomExtensionModal = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="customExtensionModal"
    >
        <Box
            className={styles.body}
            onDragOver={props.onDragOver}
            onDragLeave={props.onDragLeave}
            onDrop={props.onDrop}
        >
            <div className={styles.typeSelectorContainer}>
                <div
                    className={styles.typeSelector}
                    data-active={props.type === 'url'}
                    onClick={props.onSwitchToURL}
                    tabIndex={0}
                >
                    {'URL'}
                </div>
                <div
                    className={styles.typeSelector}
                    data-active={props.type === 'file'}
                    onClick={props.onSwitchToFile}
                    tabIndex={0}
                >
                    <FormattedMessage
                        defaultMessage="File"
                        description="Button to choose to load an extension from a local file"
                        id="tw.customExtensionModal.file"
                    />
                </div>
                <div
                    className={styles.typeSelector}
                    data-active={props.type === 'text'}
                    onClick={props.onSwitchToText}
                    tabIndex={0}
                >
                    <FormattedMessage
                        defaultMessage="Text"
                        description="Button to choose to load an extension from a text input"
                        id="tw.customExtensionModal.text"
                    />
                </div>
            </div>

            {props.type === 'url' ? (
                <React.Fragment key={props.type}>
                    <p>
                        <FormattedMessage
                            defaultMessage="Enter the extension's URL:"
                            description="Label that appears when loading a custom extension from a URL"
                            id="tw.customExtensionModal.promptURL"
                        />
                    </p>
                    <input
                        type="text"
                        className={styles.urlInput}
                        value={props.url}
                        onChange={props.onChangeURL}
                        onKeyDown={props.onKeyDown}
                        placeholder="https://extensions.turbowarp.org/"
                        autoFocus
                    />
                </React.Fragment>
            ) : props.type === 'file' ? (
                <React.Fragment key={props.type}>
                    <p>
                        <FormattedMessage
                            defaultMessage="Select the extension's JavaScript file:"
                            description="Label that appears when loading a custom extension from a file"
                            id="tw.customExtensionModal.promptFile"
                        />
                    </p>
                    <FileInput
                        accept=".js"
                        onChange={props.onChangeFile}
                        file={props.file}
                    />
                </React.Fragment>
            ) : (
                <React.Fragment key={props.type}>
                    <p>
                        <FormattedMessage
                            defaultMessage="Enter the extension's JavaScript source code:"
                            description="Label that appears when loading a custom extension from a text input"
                            id="tw.customExtensionModal.promptText"
                        />
                    </p>
                    <textarea
                        className={styles.textCodeInput}
                        placeholder={'class Extension {\n  // ...\n}\nScratch.extensions.register(new Extension());'}
                        value={props.text}
                        onChange={props.onChangeText}
                        autoFocus
                    />
                </React.Fragment>
            )}

            {/* eslint-disable max-len */}
            {/* eslint-disable-next-line no-negated-condition */}
            <label className={styles.unsandboxedContainer}>
                <FancyCheckbox
                    className={styles.unsandboxedCheckbox}
                    checked={props.defaultUnsandboxed || props.forceUnsandboxed}
                    onChange={props.onChangeForceUnsandboxed}
                    disabled={styles.defaultUnsandboxed}
                />
                <FormattedMessage
                    defaultMessage="Force this extension to run unsandboxed"
                    description="Message that appears in custom extension prompt"
                    id="tw.customExtensionModal.unsandboxed"
                />
            </label>
            {props.defaultUnsandboxed ? (
                <p className={styles.trustedExtension}>
                    <FormattedMessage
                        defaultMessage="This extension will always be loaded without the sandbox because it is from a trusted source."
                        description="Message that appears in custom extension prompt"
                        id="tw.customExtensionModal.trusted"
                    />
                </p>
            ) : props.forceUnsandboxed ? (
                <div className={styles.unsandboxedWarning}>
                    <FormattedMessage
                        defaultMessage="Loading unknown extensions wihout the sandbox is dangerous. If you are't sure what this means, please disable this option."
                        description="Warning to not disable the sandbox for no reason"
                        id="tw.unsandboxedWarning.1"
                    />
                </div>
            ) : null}
            {/* eslint-enable max-len */}

            <div className={styles.buttonRow}>
                <button
                    className={styles.loadButton}
                    onClick={props.onLoadExtension}
                    disabled={!props.canLoadExtension}
                >
                    <FormattedMessage
                        defaultMessage="Load"
                        description="Button that loads the given custom extension"
                        id="tw.customExtensionModal.load"
                    />
                </button>
            </div>
        </Box>
    </Modal>
);

CustomExtensionModal.propTypes = {
    intl: intlShape,
    canLoadExtension: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['url', 'file', 'text']).isRequired,
    onSwitchToFile: PropTypes.func.isRequired,
    onSwitchToURL: PropTypes.func.isRequired,
    onSwitchToText: PropTypes.func.isRequired,
    file: PropTypes.instanceOf(File),
    onChangeFile: PropTypes.func.isRequired,
    onDragOver: PropTypes.func.isRequired,
    onDragLeave: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    onChangeURL: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    defaultUnsandboxed: PropTypes.bool.isRequired,
    forceUnsandboxed: PropTypes.bool.isRequired,
    onChangeForceUnsandboxed: PropTypes.func.isRequired,
    onLoadExtension: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default injectIntl(CustomExtensionModal);

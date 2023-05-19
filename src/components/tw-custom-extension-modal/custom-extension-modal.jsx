import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FileInput from './file-input.jsx';
import styles from './custom-extension-modal.css';

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
                        placeholder="https://"
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
                    />
                </React.Fragment>
            )}

            <label
                className={styles.unsandboxedContainer}
            >
                <input
                    type="checkbox"
                    onChange={props.onChangeUnsandboxed}
                    checked={props.unsandboxed}
                />
                {' '}
                <FormattedMessage
                    defaultMessage="Force load unsandboxed"
                    description="Checkbox to load a custom extension without the sandbox"
                    id="tw.customExtensionModal.unsandboxed"
                />
            </label>

            {props.unsandboxed && (
                <p className={styles.danger}>
                    <FormattedMessage
                        defaultMessage="Loading extensions as unsandboxed is dangerous."
                        description="Message explainin why enabling the unsandboxed checkbox is dangerous"
                        id="tw.customExtensionModal.unsandboxedDanger"
                    />
                </p>
            )}

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
    unsandboxed: PropTypes.bool.isRequired,
    onChangeUnsandboxed: PropTypes.func.isRequired,
    onLoadExtension: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default injectIntl(CustomExtensionModal);

import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Modal from '../../containers/modal.jsx';
import ManageFont from './manage-font.jsx';
import AddSystemFont from './add-system-font.jsx';
import AddCustomFont, {FONT_FORMATS} from './add-custom-font.jsx';
import AddLibraryFont from './add-library-font.jsx';
import styles from './fonts-modal.css';

const messages = defineMessages({
    title: {
        defaultMessage: 'Fonts',
        description: 'Title of custom font management modal',
        id: 'tw.fonts.title'
    }
});

const FontModal = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="fontModal"
    >
        <div className={styles.body}>
            {props.screen === '' ? (

                <div className={styles.openButtons}>
                    <button
                        className={styles.openButton}
                        onClick={props.onOpenSystemFonts}
                    >
                        <img className={classNames(styles.openButtonImage, styles.systemImage)} />
                        <div className={styles.openButtonText}>
                            <div className={styles.openButtonTextMain}>
                                <FormattedMessage
                                    defaultMessage="Use a system font"
                                    description="Part of font management modal"
                                    id="tw.fonts.system1"
                                />
                            </div>
                            <div className={styles.openButtonTextSub}>
                                <FormattedMessage
                                    // eslint-disable-next-line max-len
                                    defaultMessage="May not appear correctly for everyone."
                                    description="Part of font management modal"
                                    id="tw.fonts.system2"
                                />
                            </div>
                        </div>
                    </button>

                    <button
                        className={styles.openButton}
                        onClick={props.onOpenCustomFonts}
                    >
                        <img className={classNames(styles.openButtonImage, styles.customImage)} />
                        <div className={styles.openButtonText}>
                            <div className={styles.openButtonTextMain}>
                                <FormattedMessage
                                    defaultMessage="Add font from a file"
                                    description="Part of font management modal"
                                    id="tw.fonts.custom1"
                                />
                            </div>
                            <div className={styles.openButtonTextSub}>
                                <FormattedMessage
                                    defaultMessage="{formats} supported."
                                    // eslint-disable-next-line max-len
                                    description="Part of font management modal. Appears under option to add a font from a local file. {formats} is replace with a comma-separated list of file formats like '.ttf, .otf'"
                                    id="tw.fonts.custom2"
                                    values={{
                                        formats: Object.values(FONT_FORMATS).join(', ')
                                    }}
                                />
                            </div>
                        </div>
                    </button>
                </div>
            ) : props.screen === 'library' ? (
                <AddLibraryFont
                    fontManager={props.fontManager}
                    onClose={props.onClose}
                />
            ) : props.screen === 'system' ? (
                <AddSystemFont
                    fontManager={props.fontManager}
                    onClose={props.onClose}
                />
            ) : props.screen === 'custom' ? (
                <AddCustomFont
                    fontManager={props.fontManager}
                    onClose={props.onClose}
                />
            ) : (
                // Should never happen
                null
            )}

            {props.screen === '' && (
                <div className={styles.fontsOuter}>
                    <p>
                        {props.fonts.length ? (
                            <FormattedMessage
                                defaultMessage="Installed fonts:"
                                description="Part of font management modal"
                                id="tw.fonts.list"
                            />
                        ) : (
                            <FormattedMessage
                                defaultMessage="No fonts added yet."
                                description="Part of font management modal"
                                id="tw.fonts.none"
                            />
                        )}
                    </p>

                    {props.fonts.length > 0 && (
                        <div className={styles.fonts}>
                            {props.fonts.map((font, index) => (
                                <ManageFont
                                    key={index}
                                    name={font.name}
                                    family={font.family}
                                    index={index}
                                    fontManager={props.fontManager}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    </Modal>
);

FontModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    fonts: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        family: PropTypes.string.isRequired
    }).isRequired).isRequired,
    fontManager: PropTypes.shape({}),
    screen: PropTypes.oneOf([
        '',
        'library',
        'system',
        'custom'
    ]),
    onOpenSystemFonts: PropTypes.func.isRequired,
    // onOpenLibraryFonts: PropTypes.func.isRequired,
    onOpenCustomFonts: PropTypes.func.isRequired
};

export default injectIntl(FontModal);

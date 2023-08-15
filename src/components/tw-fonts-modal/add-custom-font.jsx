import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';
import bindAll from 'lodash.bindall';
import styles from './fonts-modal.css';
import LoadTemporaryFont from './load-temporary-font.jsx';
import FontPlayground from './font-playground.jsx';
import FontFallback from './font-fallback.jsx';
import AddButton from './add-button.jsx';

const messages = defineMessages({
    error: {
        defaultMessage: 'Failed to read font file: {error}',
        description: 'Part of font management modal. Appears when a font from a local file could not be read.',
        id: 'tw.fonts.readError'
    }
});

const formatFontName = filename => {
    // Remove file extension
    const idx = filename.indexOf('.');
    if (idx !== -1) {
        filename = filename.substring(0, idx);
    }
    return filename;
};

export const FONT_FORMATS = [
    '.ttf',
    '.otf',
    '.woff',
    '.woff2'
];

class AddCustomFont extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeFile',
            'handleChangeName',
            'handleChangeFallback',
            'handleFinish'
        ]);
        this.state = {
            file: null,
            url: null,
            name: '',
            fallback: FontFallback.DEFAULT,
            loading: false
        };
    }

    componentWillUnmount () {
        URL.revokeObjectURL(this.state.url);
    }

    handleChangeFile (e) {
        const file = e.target.files[0] || null;
        if (file) {
            this.setState({
                file,
                name: formatFontName(file.name),
                url: URL.createObjectURL(file)
            });
        } else {
            URL.revokeObjectURL(this.state.url);
            this.setState({
                file,
                name: null,
                url: null
            });
        }
    }

    handleChangeName (e) {
        this.setState({
            name: e.target.value
        });
    }

    handleChangeFallback (fallback) {
        this.setState({
            fallback
        });
    }

    handleFinish () {
        this.setState({
            loading: true
        });

        const fr = new FileReader();
        fr.onload = () => {
            const data = new Uint8Array(fr.result);
            this.props.fontManager.addCustomFont(this.state.name, this.state.fallback, data);
            this.props.onClose();
        };
        fr.onerror = () => {
            // eslint-disable-next-line no-alert
            alert(this.props.intl.formatMessage(messages.error), {
                error: fr.error
            });

            this.setState({
                loading: false
            });
        };
        fr.readAsArrayBuffer(this.state.file);
    }

    render () {
        return (
            <React.Fragment>
                <p>
                    <FormattedMessage
                        defaultMessage="Select a font file from your computer:"
                        description="Part of font management modal."
                        id="tw.fonts.custom.file"
                    />
                </p>

                <input
                    type="file"
                    onChange={this.handleChangeFile}
                    className={styles.fileInput}
                    accept={FONT_FORMATS.join(',')}
                    readOnly={this.state.loading}
                />

                {this.state.file && (
                    <React.Fragment>
                        <p>
                            <FormattedMessage
                                defaultMessage="Give the font a name:"
                                description="Part of font management modal."
                                id="tw.fonts.custom.name"
                            />
                        </p>

                        <input
                            type="text"
                            className={styles.fontInput}
                            onChange={this.handleChangeName}
                            value={this.state.name}
                            autoFocus
                            readOnly={this.state.loading}
                        />

                        <LoadTemporaryFont url={this.state.url}>{family => (
                            <FontPlayground family={family} />
                        )}</LoadTemporaryFont>

                        <FontFallback
                            fallback={this.state.fallback}
                            onChange={this.handleChangeFallback}
                        />

                        <AddButton
                            onClick={this.handleFinish}
                            disabled={!this.state.name || this.state.loading}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

AddCustomFont.propTypes = {
    intl: intlShape,
    fontManager: PropTypes.shape({
        addCustomFont: PropTypes.func
    }),
    onClose: PropTypes.func.isRequired
};

export default injectIntl(AddCustomFont);

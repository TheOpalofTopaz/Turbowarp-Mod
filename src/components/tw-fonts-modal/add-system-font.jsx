import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import bindAll from 'lodash.bindall';
import FontPlayground from './font-playground.jsx';
import FontFallback from './font-fallback.jsx';
import AddButton from './add-button.jsx';
import styles from './fonts-modal.css';

class AddSystemFont extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChange',
            'handleChangeFallback',
            'handleFinish'
        ]);
        this.state = {
            font: '',
            fallback: FontFallback.DEFAULT,
            localFonts: null
        };
    }

    componentDidMount () {
        // Chrome-only API
        if (typeof queryLocalFonts === 'function') {
            // eslint-disable-next-line no-undef
            queryLocalFonts().then(fonts => {
                const uniqueFamilies = [...new Set(fonts.map(i => i.family))];
                this.setState({
                    localFonts: uniqueFamilies
                });
            });
        }
    }

    handleChange (e) {
        this.setState({
            font: e.target.value
        });
    }

    handleChangeFallback (fallback) {
        this.setState({
            fallback
        });
    }

    handleFinish () {
        this.props.fontManager.addSystemFont(this.state.font, this.state.fallback);
        this.props.onClose();
    }

    render () {
        return (
            <React.Fragment>
                <p>
                    <FormattedMessage
                        // eslint-disable-next-line max-len
                        defaultMessage="Type in the name of any font built in to your computer. The font may not appear correctly for everyone."
                        description="Part of font management modal."
                        id="tw.fonts.system.name"
                    />
                </p>

                {/* TODO: datalist is acutally just not very good. we should consider our own dropdown. */}
                <input
                    value={this.state.font}
                    onChange={this.handleChange}
                    className={styles.fontInput}
                    placeholder="Wingdings"
                    autoFocus
                    list="fontslist"
                />
                <datalist id="fontslist">
                    {this.state.localFonts && this.state.localFonts.map(family => (
                        <option
                            key={family}
                            value={family}
                        />
                    ))}
                </datalist>

                {this.state.font && (
                    <React.Fragment>
                        <FontPlayground family={this.state.font} />

                        <FontFallback
                            fallback={this.state.fallback}
                            onChange={this.handleChangeFallback}
                        />
                    </React.Fragment>
                )}

                <AddButton
                    onClick={this.handleFinish}
                    disabled={!this.state.font}
                />
            </React.Fragment>
        );
    }
}

AddSystemFont.propTypes = {
    fontManager: PropTypes.shape({
        addSystemFont: PropTypes.func.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default AddSystemFont;

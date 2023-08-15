import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import styles from './fonts-modal.css';
import LoadTemporaryFont from './load-temporary-font.jsx';
import FontPlayground from './font-playground.jsx';
import FontFallback from './font-fallback.jsx';

class AddLibraryFont extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeSearch',
            'handleChangeName',
            'handleChangeFallback'
        ]);
        this.state = {
            loading: true,
            error: null,
            fonts: [],
            search: '',
            name: '',
            fallback: ''
        };
    }

    componentDidMount () {
        fetch('http://localhost:8003/metadata/fonts-v0.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP status ${res.status}`);
                }
                return res.json();
            })
            .then(json => {
                this.setState({
                    loading: false,
                    fonts: json
                });
            })
            .catch(error => {
                this.setState({
                    loading: false,
                    error: `${error}`
                });
            });
    }

    handleChangeSearch (e) {
        this.setState({
            search: e.target.value
        });
    }

    search () {
        const query = this.state.search.toLowerCase();
        const results = [];
        for (const font of this.state.fonts) {
            if (font.name.toLowerCase().includes(query)) {
                results.push(font);
                if (results.length >= 5) {
                    break;
                }
            }
        }
        return results;
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

    }

    render () {
        return (
            <React.Fragment>
                {this.state.error ? (
                    <div className={styles.libraryError}>
                        {this.state.error}
                    </div>
                ) : this.state.loading ? (
                    <div className={styles.libraryLoading}>
                        {'Loading...'}
                    </div>
                ) : (
                    <React.Fragment>
                        <input
                            value={this.state.search}
                            onChange={this.handleChangeSearch}
                            autoFocus
                            className={styles.fontInput}
                        />

                        {this.search().map(font => (
                            <button
                                key={font.filename}
                                className={styles.libraryFont}
                            >
                                <LoadTemporaryFont url={`http://localhost:8003/${font.filename}`}>{family => (
                                    <div
                                        className={styles.libraryFontName}
                                        style={{
                                            fontFamily: family
                                        }}
                                    >
                                        {font.name}
                                    </div>
                                )}</LoadTemporaryFont>
                            </button>
                        ))}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

AddLibraryFont.propTypes = {
    fontManager: PropTypes.shape({
        addCustomFont: PropTypes.func
    }),
    onClose: PropTypes.func.isRequired
};

export default AddLibraryFont;

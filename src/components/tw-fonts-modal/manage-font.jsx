import React from 'react';
import PropTypes from 'prop-types';
import {} from 'react-intl';
import bindAll from 'lodash.bindall';
import styles from './fonts-modal.css';
import deleteIcon from './delete.svg';

class ManageFont extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleDelete'
        ]);
    }
    handleDelete () {
        debugger;
        this.props.fontManager.deleteFont(this.props.index);
    }
    render () {
        return (
            <div className={styles.manageFont}>
                <div
                    className={styles.manageFontName}
                    title={this.props.name}
                    style={{
                        fontFamily: this.props.family
                    }}
                >
                    {this.props.name}
                </div>

                <button
                    className={styles.manageFontDelete}
                    onClick={this.handleDelete}
                >
                    <img
                        src={deleteIcon}
                        draggable={false}
                    />
                </button>
            </div>
        );
    }
}

ManageFont.propTypes = {
    name: PropTypes.string.isRequired,
    family: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    fontManager: PropTypes.shape({
        deleteFont: PropTypes.func.isRequired
    }).isRequired
};

export default ManageFont;

import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {setCloud} from '../reducers/tw';

class CloudVariablesToggler extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'toggleCloudVariables'
        ]);
    }
    toggleCloudVariables () {
        this.props.onCloudChange(!this.props.enabled);
    }
    render () {
        return this.props.children(this.toggleCloudVariables, this.props.enabled);
    }
}

CloudVariablesToggler.propTypes = {
    children: PropTypes.func,
    enabled: PropTypes.bool,
    onCloudChange: PropTypes.func
};

const mapStateToProps = state => ({
    enabled: state.scratchGui.tw.cloud
});

const mapDispatchToProps = dispatch => ({
    onCloudChange: enabled => dispatch(setCloud(enabled))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CloudVariablesToggler);

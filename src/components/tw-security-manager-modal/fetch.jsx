import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './security-manager-modal.css';

const FetchModal = props => (
    <div>
        <FormattedMessage
            defaultMessage="The project wants to access the resource at:"
            description="Part of modal when a project asks permission to fetch a URL"
            id="tw.fetch.title"
        />
        <p className={styles.url}>
            {props.url}
        </p>
        <p>
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="The project may use this to load additional images or sounds, to access information from a public API, or for malicious purposes."
                description="Part of modal shown when a project asks permission to fetch a URL"
                id="tw.securityManager.why"
            />
        </p>
        <p>
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="This isn't a security risk, but it may share your IP address, general location, and other data from the project with the website."
                description="Part of modal shown when a project asks permission to fetch a URL"
                id="tw.securityManager.risk"
            />
        </p>
        <p>
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="If you allow this, all further requests to the same website will be automatically allowed."
                description="Part of modal shown when asking for permission to automatically load custom extension"
                id="tw.securityManager.trust"
            />
        </p>
    </div>
);

FetchModal.propTypes = {
    url: PropTypes.string.isRequired
};

export default FetchModal;

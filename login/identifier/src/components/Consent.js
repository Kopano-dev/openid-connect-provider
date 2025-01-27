import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import renderIf from 'render-if';

import { executeConsent, advanceLogonFlow, receiveValidateLogon } from '../actions/login-actions';
import { REQUEST_CONSENT_ALLOW } from '../actions/action-types';
import ClientDisplayName from './ClientDisplayName';
import ScopeList from './ScopeList';

const styles = theme => ({
  contentWrapper: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  subHeader: {
    marginBottom: theme.spacing.unit * 2,
  },
  scopeList: {
    marginBottom: theme.spacing.unit * 2,
  },
  buttonGroup: {
    marginTop: theme.spacing.unit * 3,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  buttonWrapper: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    '&:first-child': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  message: {
    marginTop: theme.spacing.unit * 2,
  },
});

class Consent extends Component {
  componentDidMount() {
    const { dispatch, hello, history, client } = this.props;
    if ((!hello || !hello.state || !client) && history.action !== 'PUSH') {
      history.replace(`/identifier${history.location.search}${history.location.hash}`);
    }

    dispatch(receiveValidateLogon({})); // XXX(longsleep): hack to reset loading and errors.
  }

  render() {
    const { classes, loading, hello, errors, client } = this.props;

    const scopes = hello.details.scopes || {};
    return (
      <div className={classes.contentWrapper}>
        <Typography variant="headline" component="h3">
          Hi {hello.displayName}
        </Typography>
        <Typography variant="subheading" className={classes.subHeader}>
          {hello.username}
        </Typography>

        <Typography variant="subheading" gutterBottom>
          <Tooltip placement="bottom" title={`Clicking "Allow" will redirect you to: ${client.redirect_uri}`}><ClientDisplayName client={client}/></Tooltip> wants to
        </Typography>
        <ScopeList dense disablePadding className={classes.scopeList} scopes={scopes}></ScopeList>
        <Typography variant="subheading" gutterBottom>Allow <ClientDisplayName client={client}/> to do this?</Typography>
        <Typography color="secondary">By clicking Allow, you allow this app to use your information.</Typography>

        <form action="" onSubmit={(event) => this.logon(event)}>
          <div className={classes.buttonGroup}>
            <div className={classes.buttonWrapper}>
              <Button
                color="secondary"
                disabled={!!loading}
                onClick={(event) => this.action(event, false)}
              >Cancel
              </Button>
              {(loading && loading !== REQUEST_CONSENT_ALLOW) && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
            <div className={classes.buttonWrapper}>
              <Button
                type="submit"
                color="primary"
                disabled={!!loading}
                onClick={(event) => this.action(event, true)}
              >Allow</Button>
              {loading === REQUEST_CONSENT_ALLOW && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </div>

          {renderIf(errors.http)(() => (
            <Typography variant="body1" color="error" className={classes.message}>{errors.http.message}</Typography>
          ))}
        </form>
      </div>
    );
  }

  action(event, allow=false) {
    event.preventDefault();

    const { dispatch, history } = this.props;
    dispatch(executeConsent(allow)).then((response) => {
      if (response.success) {
        dispatch(advanceLogonFlow(response.success, history, true, {konnect: response.state}));
      }
    });
  }
}

Consent.propTypes = {
  classes: PropTypes.object.isRequired,

  loading: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  hello: PropTypes.object,
  client: PropTypes.object.isRequired,

  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  const { hello } = state.common;
  const { loading, errors } = state.login;

  return {
    loading: loading,
    errors,
    hello,
    client: hello.details.client || {}
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Consent));

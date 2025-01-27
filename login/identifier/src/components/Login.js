import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import renderIf from 'render-if';

import { updateInput, executeLogonIfFormValid, advanceLogonFlow } from '../actions/login-actions';

const styles = theme => ({
  contentWrapper: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
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

class Login extends Component {
  componentDidMount() {
    const { hello, query, dispatch, history } = this.props;
    if (hello && hello.state && history.action !== 'PUSH') {
      if (query.prompt !== 'select_account') {
        dispatch(advanceLogonFlow(true, history));
        return;
      }

      history.replace(`/chooseaccount${history.location.search}${history.location.hash}`);
      return;
    }
  }

  render() {
    const { loading, errors, classes, username } = this.props;

    const inputProps = {
      username: {
        autoCapitalize: 'off',
        spellCheck: 'false'
      }
    };

    return (
      <div className={classes.contentWrapper}>
        <form action="" onSubmit={(event) => this.logon(event)}>
          <div>
            <TextField
              label="Username"
              error={!!errors.username}
              helperText={errors.username}
              fullWidth
              margin="dense"
              autoFocus
              inputProps={inputProps.username}
              value={username}
              onChange={this.handleChange('username')}
              autoComplete="kopano-account username"
            />
            <TextField
              type="password"
              label="Password"
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              margin="dense"
              onChange={this.handleChange('password')}
              autoComplete="kopano-account current-password"
            />
            <div className={classes.buttonGroup}>
              <div className={classes.buttonWrapper}>
                <Button
                  type="submit"
                  color="primary"
                  disabled={!!loading}
                  onClick={(event) => this.logon(event)}
                >Next</Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            </div>
          </div>

          {renderIf(errors.http)(() => (
            <Typography variant="body1" color="error" className={classes.message}>{errors.http.message}</Typography>
          ))}
        </form>
      </div>
    );
  }

  handleChange(name) {
    return event => {
      this.props.dispatch(updateInput(name, event.target.value));
    };
  }

  logon(event) {
    event.preventDefault();

    const { username, password, dispatch, history } = this.props;
    dispatch(executeLogonIfFormValid(username, password, false)).then((response) => {
      if (response.success) {
        dispatch(advanceLogonFlow(response.success, history));
      }
    });
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,

  loading: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  hello: PropTypes.object,
  query: PropTypes.object.isRequired,

  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  const { loading, username, password, errors} = state.login;
  const { hello, query } = state.common;

  return {
    loading,
    username,
    password,
    errors,
    hello,
    query
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Login));

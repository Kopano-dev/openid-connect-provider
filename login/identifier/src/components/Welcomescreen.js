import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import UCSLogo from '../images/ucs-logo.svg';
import { executeLogoff } from '../actions/common-actions';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexWrap: 'nowrap',
  },
  header: {
    marginTop: theme.spacing.unit * 10,
    marginBottom: theme.spacing.unit * 7,
  },
  limiter: {
    width: 313,
    paddingBottom: theme.spacing.unit * 2,
  },
  [`@media (max-width: ${313 + (theme.spacing.unit * 4)}px)`]: {
    limiter: {
      width: '100%',
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  paper: {
    backgroundColor: 'white',
    minHeight: 313,
    maxHeight: 550,
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    width: 120,
    height: 120,
    display: 'block',
    paddingTop: theme.spacing.unit * 7,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  contentWrapper: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  subHeader: {
    marginBottom: theme.spacing.unit * 5,
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
});

class Welcomescreen extends React.PureComponent {
  render() {
    const { classes, hello } = this.props;
    return (
      <Grid container direction="column" justify="start" alignItems="center" spacing={0} className={classes.root}>
        <Typography variant="headline" className={classes.header}>&nbsp;</Typography>
        <Grid item className={classes.limiter}>
          <Paper className={classes.paper} square elevation={2}>
            <img src={UCSLogo} className={classes.logo} alt="UCS"/>
            <div className={classes.contentWrapper}>
              <Typography variant="headline" component="h3">
                Welcome {hello.displayName}
              </Typography>
              <Typography variant="subheading" className={classes.subHeader}>
                {hello.username}
              </Typography>

              <Typography>
                You are signed in - awesome!
              </Typography>

              <div className={classes.buttonGroup}>
                <div className={classes.buttonWrapper}>
                  <Button
                    color="primary"
                    onClick={(event) => this.logoff(event)}
                  >Sign out</Button>
                </div>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  logoff(event) {
    event.preventDefault();

    this.props.dispatch(executeLogoff()).then((response) => {
      const { history } = this.props;

      if (response.success) {
        history.push('/identifier');
      }
    });
  }
}

Welcomescreen.propTypes = {
  classes: PropTypes.object.isRequired,

  hello: PropTypes.object,

  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  const { hello } = state.common;

  return {
    hello
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Welcomescreen));

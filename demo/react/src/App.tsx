import React, { FunctionComponent } from "react";
import { Provider, connect } from "react-redux";

import withStyles, { StyleRulesCallback, ClassNameMap } from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import { Form, Fieldset, FormConsumer } from "../../../src/react/Form";
import { Field } from "../../../src/react/Field";
import { store } from "./store";
import { Input } from "./form/Input";
import { validators } from "../../../src/tools/validators";

type ClassNames = "paper";
const styles: StyleRulesCallback<ClassNames> = theme => ({
  paper: {
    padding: theme.spacing.unit * 2
  }
});

const AppComponent: FunctionComponent<{ classes: ClassNameMap<ClassNames> }> = ({ classes }) => {
  return (
    <main>
      <section className="nav">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" color="inherit">
              React Demo - Instinctive Forms
            </Typography>
          </Toolbar>
        </AppBar>
      </section>
      <section className="content">
        <Provider store={store}>
          <Grid container direction="row" justify="space-around" spacing={24}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.paper}>
                <Form name="form">
                  <Fieldset name="subForm1">
                    <Input name="test" label="Test Input" />
                    <Input
                      name="test_error"
                      label="Test Error Input"
                      onChangeValidation={[validators.text("Please only enter text.")]}
                    />
                  </Fieldset>
                </Form>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.paper}>
                <DisplayStore />
              </Paper>
            </Grid>
          </Grid>
        </Provider>
      </section>
    </main>
  );
};

export const App = withStyles(styles)(AppComponent);

const DisplayStore = connect(state => ({ state }))((props: { state: any }) => {
  return <pre>{JSON.stringify(props.state, null, 2)}</pre>;
});

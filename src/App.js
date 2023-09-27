import './App.css';
import {useReducer, useRef} from "react";
import {attributes, rotateCtlAttrs} from "./utils/attrs";
import {Box, Container, Grid} from "@mui/material";
import {Board} from "./comp/Board";
import {MessageCenter} from "./comp/MessageCenter";
import {RotateCtl} from "./comp/RotateCtl";
import {createInitialState, reducers} from "./reducers";

function App() {

    const [state, dispatch] = useReducer(reducers, undefined, createInitialState);
    const {quads, selectors, message} = state;
    const inputRef = useRef(null);

    return (
        <Container
            maxWidth={false}
            sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#10456d'
            }}
        >
            <Grid container
                  direction='column'
                  alignItems='center'
                  justifyContent='center'
                  spacing={2}
            >
                <Grid item xs={2}>
                    <Box sx={{ pt: 10 }}/>
                </Grid>
                <Grid item xs={2}>
                    <MessageCenter message={message}/>
                </Grid>
                <Grid item xs={7}>
                    <Board attrs={attributes}
                           quads={quads}
                           selectors={selectors}
                           dispatch={dispatch}
                           inputRef={inputRef}
                    />
                </Grid>
                <Grid item xs={1}>
                    <RotateCtl attrs={rotateCtlAttrs} dispatch={dispatch}/>
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;

import {Box, Container, Grid} from "@mui/material";
import {forwardRef, Fragment} from "react";


const KeyboardInput = forwardRef((props, ref) => { //component which captures keyboard input

    const {callbackQuads, onKeyDownHandler, onBlurHandler} = props;

    return (
        <input
            autoFocus={true}
            style={{
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
            }}
            onKeyDown={event => onKeyDownHandler(event, callbackQuads)}
            onBlur={event => onBlurHandler(event)}
            ref={ref}
        />
    );
});

const Quad = props => { //Grid container of 3x3 cells that reports position and qid of cells clicked inside it
    const {attrs, cells, onClickQuadHandler, onClickCellHandler} = props;
    // noinspection JSValidateTypes
    return (
        <Fragment>
            <Grid container
                  onClick={() => onClickQuadHandler(cells, cells[0].qid)}
                  sx={{ ...attrs.quadAttrs }}
            >
                {
                    cells.map((cell, idx) =>
                        <Grid item xs={4}
                              key={idx}
                              sx={{
                                  m: 0,
                                  p: 2
                              }}
                        >
                            <Box sx={{ ...cell, ...cell.style }}
                                 onClick={() => onClickCellHandler(cell.pos, cell.qid)}>
                            </Box>
                        </Grid>
                    )
                }
            </Grid>
        </Fragment>
    );
}


const Board = props => { //parent component that contains the total board and reports keyboard input to App.js
    const {attrs, quads, selectors, handlers, inputRef} = props;

    // noinspection JSValidateTypes
    return (
        <Container>
            <KeyboardInput callbackQuads={quads}
                           onKeyDownHandler={handlers.onKeyDownHandler}
                           onBlurHandler={handlers.onBlurHandler}
                           ref={inputRef}/>
            <Grid container
                  columns={attrs.boardAttrs.columns}
                  sx={{ ...attrs.boardAttrs }}
            >
                {
                    quads.map((quadCells, idx) => (
                            <Grid item xs={1}
                                  key={idx}
                                  sx={{
                                      m: 0,
                                      p: 1

                                  }}
                            >
                                <Container sx={{ //highlight/selector element of the UI
                                               justifyContent: 'center',
                                               alignItems: 'center',
                                               margin: 'auto',
                                               backgroundColor: selectors[idx].backgroundColor,
                                               paddingBottom: 1, paddingRight: 0, paddingTop: 0.6,
                                               width: 290,
                                               height: 260,
                                               borderRadius: '1.5em'
                                           }}>
                                    <Quad attrs={attrs}
                                          cells={quadCells}
                                          onClickQuadHandler={handlers.onClickQuadHandler}
                                          onClickCellHandler={handlers.onClickCellHandler}/>
                                </Container>
                            </Grid>
                        )
                    )
                }
            </Grid>
        </Container>
    );
}

export { Board };

import {Box, Grid} from "@mui/material";
import {Fragment} from "react";

const Cell = props => {
    const {cellAttrs, onClickCellHandler} = props;
    return (
        <Box
            onClick={() => onClickCellHandler()}
            sx={{ ...cellAttrs, ...cellAttrs.style }}
        />
    );
}

const Quad = props => {
    const {quadAttrs, onClickQuadHandler, onClickCellHandler} = props;
    // noinspection JSValidateTypes
    return (
        <Fragment>
            <Grid container
                  onClick={() => onClickQuadHandler()}
                  sx={{ ...quadAttrs }}
            >
                {
                    quadAttrs.cells.map((cell, idx) =>
                        <Grid item xs={4}
                              key={idx}
                              sx={{
                                  m: 0,
                                  p: 2
                              }}
                        >
                            <Cell cellAttrs={quadAttrs.cellAttrs}
                                  onClickCellHandler={onClickCellHandler}/>
                        </Grid>
                    )
                }
            </Grid>
        </Fragment>
    );
}

export { Cell, Quad };

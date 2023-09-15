import {Box, Grid} from "@mui/material";

const Cell = props => {
    const {cellAttrs, onClickCellHandler} = props;
    return (
        <Box
            onClick={() => onClickCellHandler()}
            sx={{
                width: cellAttrs.width,
                height: cellAttrs.height
            }}
        >

        </Box>
    );
}

const Quad = props => {
    const {quadAttrs, onClickQuadHandler, onClickCellHandler} = props;
    return (
        <Grid container
              onClick={() => onClickQuadHandler()}
              rowSpacing={1}
              columns={quadAttrs.columns}
              sx={{
                  width: quadAttrs.width,
                  height: quadAttrs.height
              }}
        >
            {
                quadAttrs.cells.map((cell, idx) =>
                    <Grid item xs={1}
                          key={idx}
                          sx={{
                              m: 0,
                              p: 0
                          }}
                    >
                        <Cell cellAttrs={quadAttrs.cellAttrs}
                              onClickCellHandler={onClickCellHandler}/>
                    </Grid>
                )
            }
        </Grid>
    );
}

export {
    Cell, Quad
}
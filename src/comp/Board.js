import {Box, Grid} from "@mui/material";
import {Fragment} from "react";

function cellsToQuadFormat(cells, quadAttrs, rowLength) { //returns an array of 4 3x3 cell quads
    const cellSlicer = (cells, nwest, neast, cellsWidth) => [ //slices 3x3 quads of cells
        ...cells.slice(nwest, neast + 1),
        ...cells.slice(nwest + cellsWidth, neast + cellsWidth + 1),
        ...cells.slice(nwest + 2 * cellsWidth, neast + 2 * cellsWidth + 1)
    ];
    return [
        cellSlicer(cells, 0, quadAttrs.columns - 1, rowLength), //northwest section
        cellSlicer(cells, quadAttrs.columns, rowLength - 1, rowLength), //northeast section
        cellSlicer(cells, quadAttrs.columns * rowLength, quadAttrs.columns * rowLength + quadAttrs.columns - 1, rowLength), //southwest section
        cellSlicer(cells, rowLength * quadAttrs.columns + quadAttrs.columns, quadAttrs.columns * rowLength + rowLength - 1, rowLength) //southeast section
    ]
}


const Quad = props => {
    const {attrs, cells, onClickQuadHandler, onClickCellHandler} = props;
    // noinspection JSValidateTypes
    return (
        <Fragment>
            <Grid container
                  onClick={() => onClickQuadHandler()}
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
                            <Box sx={{ ...attrs.cellAttrs, ...attrs.cellAttrs.style }}
                                 onClick={() => onClickCellHandler(cell.cid, cell.quad, idx)}/>
                        </Grid>
                    )
                }
            </Grid>
        </Fragment>
    );
}


const Board = props => {
    const {cells, quads, attrs, onClickQuadHandler, onClickCellHandler} = props;
    cellsToQuadFormat(cells, attrs.quadAttrs, attrs.boardAttrs.columns * attrs.quadAttrs.columns)
        .forEach((cellSlice, idx) => quads[idx] = cellSlice);

    // noinspection JSValidateTypes
    return (
        <Fragment>
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
                                <Quad attrs={attrs}
                                      cells={quadCells}
                                      onClickQuadHandler={onClickQuadHandler}
                                      onClickCellHandler={onClickCellHandler}/>
                            </Grid>
                        )
                    )
                }
            </Grid>
        </Fragment>
    );
}

export { Board };

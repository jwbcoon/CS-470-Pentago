import {Grid} from "@mui/material";
import {Quad} from "./Quad";
import {Fragment} from "react";

function cellsToQuadFormat(cells, quadAttrs, rowLength) {
    const cellSlicer = (cells, nwest, neast, cellsWidth) => cells.slice(nwest, neast + 1)
        .concat(cells.slice(nwest + cellsWidth, neast + cellsWidth + 1))
        .concat(cells.slice(nwest + 2 * cellsWidth, neast + 2 * cellsWidth + 1));
    return [
        cellSlicer(cells, 0, quadAttrs.columns - 1, rowLength - 1), //northwest section
        cellSlicer(cells, quadAttrs.columns, rowLength - 1, rowLength - 1), //northeast section
        cellSlicer(cells, quadAttrs.columns * rowLength,
            quadAttrs.columns * rowLength + quadAttrs.columns - 1,
            rowLength - 1), //southwest section
        cellSlicer(cells, rowLength * quadAttrs.columns + quadAttrs.columns,
            quadAttrs.columns * rowLength + rowLength - 1,
            rowLength - 1) //southeast section
    ]
}

const Board = props => {
    const {cells, attrs, onClickQuadHandler, onClickCellHandler} = props;
    const quads = cellsToQuadFormat(cells, attrs.quadAttrs,
        attrs.boardAttrs.columns * attrs.quadAttrs.columns);

    // noinspection JSValidateTypes
    return (
        <Fragment>
            <Grid container
                  columns={attrs.boardAttrs.columns}
                  sx={{ ...attrs.boardAttrs }}
            >
                {
                    quads.map((quadCells, idx) => {
                        attrs.quadAttrs.cells = quadCells;
                        return (
                            <Grid item xs={1}
                                  key={idx}
                                  sx={{
                                      m: 0,
                                      p: 1
                                  }}
                            >
                                <Quad quadAttrs={attrs.quadAttrs}
                                      onClickQuadHandler={onClickQuadHandler}
                                      onClickCellHandler={onClickCellHandler}/>
                            </Grid>
                        );
                    })
                }
            </Grid>
        </Fragment>
    );
}

export { Board };

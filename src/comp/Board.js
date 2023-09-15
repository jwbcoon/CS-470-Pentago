import {Grid} from "@mui/material";
import {Quad} from "./Quad";


const Board = props => {
    const {cells, attrs, onClickQuadHandler, onClickCellHandler} = props
    attrs.quadAttrs.cells = cells;
    return (
        <Grid container
              rowSpacing={1}
              columns={attrs.boardAttrs.columns}
              sx={{
                width: attrs.boardAttrs.width,
                height: attrs.boardAttrs.height
              }}
        >
            {
                cells.map((cell, idx) => (
                        <Grid item xs={1}
                          key={idx}
                          sx={{
                              m: 0,
                              p: 0
                          }}
                    >
                        <Quad quadAttrs={attrs.quadAttrs}
                              onClickQuadHandler={onClickQuadHandler}
                              onClickCellHandler={onClickCellHandler}/>
                    </Grid>
                    )
                )
            }
        </Grid>
    );
}

export {
    Board
};
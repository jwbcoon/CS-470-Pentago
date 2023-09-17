import {Box, Grid} from "@mui/material";

const RotateCtl = props => {
    const {attrs, onClickHandler} = props;
    const [leftBox, rightBox] = ['counter-clockwise', 'clockwise'];
    return (
        <Grid container
              sx={{
                  gap: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  direction: 'row'
              }}
        >
            <Grid item
                  xs={6}
                  key={leftBox}
                  onClick={() => onClickHandler(leftBox)}
            >
                <Box sx={{ ...attrs }}>Counter Clockwise</Box>
            </Grid>
            <Grid item
                  xs={6}
                  key={rightBox}
                  onClick={() => onClickHandler(rightBox)}
            >
                <Box sx={{ ...attrs }}>Clockwise</Box>
            </Grid>
        </Grid>
    )
}

export { RotateCtl }
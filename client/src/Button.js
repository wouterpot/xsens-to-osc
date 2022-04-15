import React from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'

export default styled(({ ...otherProps }) => (
  <Button
    variant="contained"
    fullWidth
    color="primary"
    {...otherProps}
    style={{
      textTransform: 'none',
      ...(otherProps.style || []),
    }}
  />
))``

import React from 'react'
import { act, fireEvent, render } from "@testing-library/react"
import Toast from '../Toast'

describe('Toast tests', () => {
  it('renders the Toast component with message and severity', () => {
    const { getByText } = render(
      <Toast message="Test message" severity="success" />
    )

    expect(getByText(/Test message/i)).toBeInTheDocument()
  })

  it('does not render the Toast component when message is empty', () => {
    const { queryByText } = render(
      <Toast message="" severity="success" />
    )

    expect(queryByText(/Test message/i)).not.toBeInTheDocument()
  })

  it('closes the Toast when the close button is clicked', () => {
    const { getByRole, getByText } = render(
      <Toast message="Test message" severity="success" />
    )

    const closeButton = getByRole('button')
    act(() => fireEvent.click(closeButton))

    expect(getByText(/Test message/i)).not.toBeVisible()
  })

  it('closes the Toast automatically after 5 seconds', () => {
    jest.useFakeTimers()
    const { getByText } = render(
      <Toast message="Test message" severity="success" />
    )

    expect(getByText(/Test message/i)).toBeVisible()

    jest.advanceTimersByTime(5000)
    jest.useRealTimers()

    setTimeout(() => {
      expect(getByText(/Test message/i)).not.toBeVisible()
    })
  })
})

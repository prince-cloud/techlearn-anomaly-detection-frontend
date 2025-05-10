import React from "react"
import { render } from "@testing-library/react"
import EmptyTableRow from "../EmptyTableRow"

describe("Empty Table Row test", () => {
  test("Generates an empty table row with given colSpan", () => {
    const { container, getByText } = render(
      <EmptyTableRow colSpan={4} />
    )

    expect(getByText(/None/i)).toBeTruthy()
    const element = container.querySelector('td')
    expect(element).toHaveAttribute('colSpan', '4')
  })
})

import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"

// Not being used rn
const MenuTable = (
  params: {
    singleLined?: boolean,
    striped?: boolean,
    basic?: boolean | "very",
    style?: React.CSSProperties,
    children: JSX.Element | JSX.Element[],
  }
) => {
  return (
    <Table
      singleLined={params.singleLined}
      striped={params.striped}
      basic={params.basic ?? "very"}
      style={params.style ?? { borderRadius: 0 }}
    >
      {params.children}
    </Table>
  )
}

const MenuTableHeader = (
  params: {
    style?: React.CSSProperties,
    children: JSX.Element,
  }
) => {
  return (
    <TableHeader style={params.style ?? { backgroundColor: "#43a047" }}>{params.children}</TableHeader>
  )
}

const MenuTableHeaderCell = (
  params: {
    style?: React.CSSProperties,
    collapsing?: boolean | undefined,
    children: JSX.Element | string,
  }
) => {
  return (
    <TableHeaderCell
      style={params.style ?? { padding: "0.5rem", color: "white", borderRadius: 0 }}
      collapsing={params.collapsing}
    >
      {params.children}
    </TableHeaderCell>
  )
}

const MenuTableRow = (
  params: {
    style?: React.CSSProperties,
    children: JSX.Element | JSX.Element[],
  }
) => {
  return (
    <TableRow style={params.style}>{params.children}</TableRow>
  )
}

const MenuTableBody = (
  params: {
    children: JSX.Element | JSX.Element[],
  }
) => {
  return (
    <TableBody>{params.children}</TableBody>
  )
}

const MenuTableCell = (
  params: {
    style?: React.CSSProperties,
    collapsing?: boolean | undefined,
    colSpan?: number,
    children: JSX.Element | string,
  }
) => {
  return (
    <TableCell style={params.style ?? { padding: "0.5rem", border: 0 }} colSpan={params.colSpan}>{params.children}</TableCell>
  )
}

export { MenuTable, MenuTableCell, MenuTableRow, MenuTableBody, MenuTableHeader, MenuTableHeaderCell };

// eslint-disable-next-line
import React from 'react'

/**
 * Cell represents the atomic element of a table
 */
export default class Cell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      value: props.value,
    }
    this.display = this.determineDisplay({ x: props.x, y: props.y }, props.value)
    this.timer = 0
    this.delay = 200
    this.prevent = false
  }

  /**
   * Add listener to the `unselectAll` event used to broadcast the
   * unselect all event
   */
  componentDidMount() {
    window.document.addEventListener('unselectAll', this.handleUnselectAll)
  }

  /**
   * Performance lifesaver as the cell not touched by a change can
   * decide to avoid a rerender
   */
  shouldComponentUpdate(nextProps, nextState) {
    // Has a formula value? could be affected by any change. Update
    if (this.state.value !== '' && this.state.value.slice(0, 1) === '=') {
      return true
    }

    // Its own state values changed? Update
    // Its own value prop changed? Update
    if (nextState.value !== this.state.value ||
      nextState.editing !== this.state.editing ||
      nextState.selected !== this.state.selected ||
      nextProps.value !== this.props.value) {
      return true
    }

    return false
  }

  /**
   * Before updating, execute the formula on the Cell value to calculate the
   * `display` value. Especially useful when a redraw is pushed upon this cell
   * when editing another cell that this might depend upon
   */
  componentWillUpdate() {
    this.display = this.determineDisplay({ x: this.props.x, y: this.props.y }, this.state.value)
  }

  /**
   * Remove the `unselectAll` event listener added in `componentDidMount()`
   */
  componentWillUnmount() {
    window.document.removeEventListener('unselectAll', this.handleUnselectAll)
  }

  /**
   * When a Cell value changes, re-determine the display value
   * by calling the formula calculation
   */
  onChange = (e) => {
    this.setState({ value: e.target.value })
    this.display = this.determineDisplay({ x: this.props.x, y: this.props.y }, e.target.value)
    this.props.updateCells()
  }

  /**
   * Handle pressing a key when the Cell is an input element
   */
  onKeyPressOnInput = (e) => {
    if (e.key === 'Enter') {
      this.hasNewValue(e.target.value)
    }
  }

  /**
   * Handle pressing a key when the Cell is a span element,
   * not yet in editing mode
   */
  onKeyPressOnSpan = () => {
    if (!this.state.editing) {
      this.setState({ editing: true })
    }
  }

  /**
   * Handle moving away from a cell, stores the new value
   */
  onBlur = (e) => {
    this.hasNewValue(e.target.value)
  }

  /**
   * Used by `componentDid(Un)Mount`, handles the `unselectAll` event response
   */
  handleUnselectAll = () => {
    if (this.state.selected || this.state.editing) {
      this.setState({ selected: false, editing: false })
    }
  }

  /**
   * Called by the `onBlur` or `onKeyPressOnInput` event handlers,
   * it escalates the value changed event, and restore the editing state
   * to `false`.
   */
  hasNewValue = (value) => {
    this.props.onChangedValue(
      {
        x: this.props.x,
        y: this.props.y,
      },
      value,
    )
    this.setState({ editing: false })
  }

  /**
   * Emits the `unselectAll` event, used to tell all the other cells to
   * unselect
   */
  emitUnselectAllEvent = () => {
    const unselectAllEvent = new Event('unselectAll')
    window.document.dispatchEvent(unselectAllEvent)
  }

  /**
   * Handle clicking a Cell.
   */
  clicked = () => {
    this.emitUnselectAllEvent()
    this.setState({ selected: true })
  }

  /**
   * Handle doubleclicking a Cell.
   */
  doubleClicked = (e) => {
    e.preventDefault()
    this.emitUnselectAllEvent()
    this.setState({ editing: true, selected: true })
  }

  /**
   * Executes the formula calculation on the cell value
   */
  determineDisplay = ({ x, y }, value) => {
    if (value.slice(0, 1) === '=') {
      const res = this.props.executeFormula({ x, y }, value.slice(1))
      if (res.error !== null) {
        return 'INVALID'
      }
      return res.result
    }
    return value
  }

  render() {
    const style = this.state.selected || this.state.editing ? { 'border': '2px solid #1e6337' } : null

    // column 0
    if (this.props.x === 0) {
      const label = this.props.y === 0 ? '' : this.props.y
      return (
        <th>
          <span>
            {label}
          </span>
        </th>
      )
    }

    // row 0
    if (this.props.y === 0) {
      const alpha = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      return (
        <th>
          <span onKeyPress={this.onKeyPressOnSpan} role="presentation">
            {alpha[this.props.x]}
          </span>
        </th>
      )
    }

    if (this.state.editing) {
      return (
        <td style={style}>
          <input
            type="text"
            onBlur={this.onBlur}
            onKeyPress={this.onKeyPressOnInput}
            value={this.state.value}
            onChange={this.onChange}
            autoFocus
          />
        </td>
      )
    }
    return (
      <td style={style}>
        <span
          onClick={e => this.clicked(e)}
          onDoubleClick={e => this.doubleClicked(e)}
          role="presentation"
        >
          {this.display}
        </span>
      </td>
    )
  }
}


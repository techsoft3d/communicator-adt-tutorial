/*export default*/ class CustomMarkupItem extends Communicator.Markup.MarkupItem { 
    constructor(viewer, nodeId, nodeName, selectionPosition, normal, length, width, height) {
        super();
        this._viewer = viewer;
        this._nodeId = nodeId;
        this._nodeName = nodeName;
        this._selectionPosition = selectionPosition.copy();
        this._normal = normal.copy();
        this._length = length;
        this._width = width;
        this._height = height;

        this._lineGeometryShape = new Communicator.Markup.Shape.Polyline();
        this._lineGeometryShape.setStrokeWidth(2);
        this._lineGeometryShape.setStrokeColor(this._viewer.measureManager.getMeasurementColor());
        this._lineGeometryShape.setStartEndcapType(Communicator.Markup.Shape.EndcapType.Arrowhead);

        this._textBox = new Communicator.Markup.Shape.TextBox();
        this._textBox.getBoxPortion().setFillOpacity(1);
        this._textBox.getBoxPortion().setFillColor(new Communicator.Color(255, 255, 255));
        this._textBox.setTextString(this._nodeName);
    }

    draw() {
        const renderer = this._viewer.markupManager.getRenderer();
        const view = this._viewer.view;

        const secondPoint = this._selectionPosition.copy().add(this._normal.copy().scale(this._length));
        const secondPointProjected = Communicator.Point2.fromPoint3(view.projectPoint(secondPoint));

        // Adjust text box location to avoid placed outside of the view
        if (undefined != this._width && undefined != this._width) {
            let size = renderer.measureTextBox(this._textBox);
            if (this._width <= (secondPointProjected.x + size.x) && size.x < this._width) {
                secondPointProjected.x = this._width - size.x;
            }
            if (this._height <= (secondPointProjected.y + size.y) && size.y < this._height) {
                secondPointProjected.y = this._height - size.y;
            }
        }

        this._textBox.setPosition(secondPointProjected);
        
        renderer.drawTextBox(this._textBox);
    }

    hit(point) {
        const measurement = this._viewer.markupManager.getRenderer().measureTextBox(this._textBox);
        const position = this._textBox.getPosition();
        if (point.x < position.x)
            return false;
        if (point.x > position.x + measurement.x)
            return false;
        if (point.y < position.y)
            return false;
        if (point.y > position.y + measurement.y)
            return false;
        return true;
    }
    getPosition() {
        return this._selectionPosition.copy();
    }
    getNormal() {
        return this._normal.copy();
    }
    setLength(length) {
        this._length = length;
    }
}
Mazen
=========

### Javascript Maze Dungeon Generator library

#### Usage
```js
var width = 93;
var height = 93;
var mazen = new Mazen(width, height);// edges must be odd size.

mazen.generate();

var x, y;

for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
        var terrain = mazen.getMap(x, y);

        switch (terrain) {
        // DO SOMETHING
        }
    }
}
```
#### Parameters
<table>
    <thead>
        <tr>
            <th>Parameter</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>generationMaxTry</strong></td>
            <td><em>5</em></td>
            <td>if it is not possible to generate an appropriate maze it recursively call generate method.</td>
        </tr>
        <tr>
            <td><strong>roomCreationMaxTry</strong></td>
            <td><em>5</em></td>
            <td>if it could not create minimum number of rooms it recursively call createRooms method.</td>
        </tr>
        <tr>
            <td><strong>minRooms</strong></td>
            <td><em>8</em></td>
            <td>minimum number of rooms to create.</td>
        </tr>
        <tr>
            <td><strong>maxRooms</strong></td>
            <td><em>25</em></td>
            <td>maximum number of rooms to create, although it is not strictly promised.</td>
        </tr>
        <tr>
            <td><strong>combinedRooms</strong></td>
            <td><em>6</em></td>
            <td>if createExtraCombinedRooms is true it tries to create rooms around original rooms to broaden its territory.</td>
        </tr>
        <tr>
            <td><strong>minRoomSize</strong></td>
            <td><em>40</em></td>
            <td>square size of minimum room size.</td>
        </tr>
        <tr>
            <td><strong>maxRoomSize</strong></td>
            <td><em>100</em></td>
            <td>square size of maximum room size.</td>
        </tr>
        <tr>
            <td><strong>minRoomSize</strong></td>
            <td><em>true</em></td>
            <td>if it is "true", it tries to remove dead ends.</td>
        </tr>
        <tr>
            <td><strong>createExtraCombinedRooms</strong></td>
            <td><em>true</em></td>
            <td>if it is true it tries to create rooms around original rooms to broaden its territory.</td>
        </tr>
        <tr>
            <td><strong>createStairsAtDeadEnd</strong></td>
            <td><em>false</em></td>
            <td>if it is true it creates stairs at dead end of corridor.</td>
        </tr>
        <tr>
            <td><strong>createExtraEntrance</strong></td>
            <td><em>true</em></td>
            <td>if it is true it creates extra entrances for rooms.</td>
        </tr>
        <tr>
            <td><strong>removeDeadEnd</strong></td>
            <td><em>true</em></td>
            <td>if it is true it tries to remove dead ends at ratio of a removeDeadEndRatio parameter has given.</td>
        </tr>
        <tr>
            <td><strong>branchOut</strong></td>
            <td><em>false</em></td>
            <td>if it is true it tries to branch out corridor at ratio of a corridorBranchOutRatio parameter has given.</td>
        </tr>
        <tr>
            <td><strong>maxExtraEntrances</strong></td>
            <td><em>3</em></td>
            <td>maximum number of extra entrances to create.</td>
        </tr>
        <tr>
            <td><strong>removeDeadEndRatio</strong></td>
            <td><em>0.85</em></td>
            <td>ratio of removing dead ends.</td>
        </tr>
        <tr>
            <td><strong>corridorCurveRatio</strong></td>
            <td><em>0.4</em></td>
            <td>ratio of make curves on corridor creation.</td>
        </tr>
        <tr>
            <td><strong>corridorBranchOutRatio</strong></td>
            <td><em>0.4</em></td>
            <td>ratio of branch out corridor.</td>
        </tr>
    </tbody>
</table>

#### Demo

[DEMO](http://ishibashijun.github.io/game%20development/2015/10/16/mazen)

#### LICENSE

[MIT](http://www.opensource.org/licenses/mit-license.php)
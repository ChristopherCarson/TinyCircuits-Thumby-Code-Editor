import { ComponentContainer, ComponentItemConfig, GoldenLayout, ItemType, LayoutManager, LayoutConfig } from "../golden-layout/bundle/esm/golden-layout.js";
import { EMULATOR } from "./emulator_wrapper.js";

// https://github.com/golden-layout/golden-layout#building-single-file-bundles (commands to build bundle from source need to be done on Windows)
// https://codepen.io/pbklink/pen/dyWJNNm
// https://replit.com/@koenigmm/GoldenLayout-dynamic-component-creation-example

const layoutSaveKey = "layout";

var myLayout = new GoldenLayout(document.getElementById("IDLayoutContainer"));

var DIR = new DIRCHOOSER();
var ARCADE = new Arcade();


// Open the arcade if the url/link indicates to do so
window.addEventListener("load", (event) => {
    if(window.location.origin.indexOf("arcade.thumby.us") != -1){
        ARCADE.show();
    }else if(window.location.origin.indexOf("tinycircuits.github.io") != -1){
        alert("WARNING!\n\nThe Thumby Code Editor location is changing!\n\nPlease start using https://code.thumby.us/\n\nhttps://tinycircuits.github.io/ and files stored on it will no longer be accessible starting March 16th, 2022")
    }
});


var onExportToEditor = (bytes) => {
    var editorSpriteID = 0;
    var filePath = undefined;
    while(true){
        var increased = false;
        filePath = "/sprite" + editorSpriteID + ".bin";

        for (const [id, editor] of Object.entries(EDITORS)) {
            if(editor.EDITOR_PATH == filePath){
                editorSpriteID = editorSpriteID + 1;
                increased = true;
            }
        }
        if(increased == false){
            break;
        }
    }

    // Find editor with smallest ID, focus it, then add new editor with file contents
    var currentId = Infinity;
    for (const [id, editor] of Object.entries(EDITORS)) {
        currentId = id;
    }
    if(currentId != Infinity){
        EDITORS[currentId]._container.parent.focus();
    }

    // Pass the file contents to the new editor using the state
    var state = {};
    state.value = bytes;
    state.path = filePath;
    myLayout.addComponent('Editor', state, 'Editor');
}
var IMPORTER = new Importer(document.getElementById("IDImportSpriteBTN"), onExportToEditor);



// Show pop-up containing IDE changelog every time showChangelogVersion is increased
const showChangelogVersion = 15;

// This should match what is in /ThumbyGames/lib/thumby.py as '__version__'
window.latestThumbyLibraryVersion = 1.6

if(localStorage.getItem(showChangelogVersion) == null){
    console.log("Updates to IDE! Showing changelog...");    // Show message in console
    localStorage.removeItem(showChangelogVersion-1);        // Remove flag from last version

    fetch("CHANGELOG.txt").then(async (response) => {
        await response.text().then((text) => {
            var listener = window.addEventListener("keydown", (event) => {
                document.getElementById("IDChangelog").style.display = "none";
                window.removeEventListener("keydown", listener);
            });
            document.getElementById("IDChnagelogExitBtn").onclick = (event) => {
                document.getElementById("IDChangelog").style.display = "none";
            }
            document.getElementById("IDChangelog").style.display = "flex";
            document.getElementById("IDChangelogText").innerText = text;
        });
    });

    localStorage.setItem(showChangelogVersion, true);       // Set this show not shown on next page load
}


// Want the dropdown to disappear if mouse leaves it (doesn't disappear if mouse leaves button that starts it though)
document.getElementById("IDUtilitesDropdown").addEventListener("mouseleave", () => {
    UIkit.dropdown(document.getElementById("IDUtilitesDropdown")).hide();
})


var progressBarElem = document.getElementById("IDProgressBar");
var lastMessage = undefined;
window.setPercent = (percent, message) => {
    progressBarElem.style.width = percent + "%";

    if(message != undefined){
        progressBarElem.innerText = message + " " + percent + "%";
        lastMessage = message;
    }else{
        progressBarElem.innerText = lastMessage + " " + Math.round(percent) + "%";
    }
}
window.resetPercentDelay = () => {
    setTimeout(() => {
        progressBarElem.style.width = "0%";
        progressBarElem.innerText = "";
    }, 100);
}


var defaultConfig = {
    header:{
        popout: false,
        showCloseIcon: false
    },
    dimensions: {
        borderWidth: 5,
        minItemHeight: 10,
        minItemWidth: 10,
        headerHeight: 20,
        dragProxyWidth: 300,
        dragProxyHeight: 200
    },
    labels: {
        close: 'close',
        maximise: 'maximise',
        minimise: 'minimise',
        popout: 'open in new window'
    },


    content: [{
        type: 'column',
        id: 'rootcolumn',
        content: [{
            type: 'row',
            isClosable: false,
            id: 'rootrow',
            content:[{
                type: 'stack',
                width: 20,
                id: 'BitmapPlusFS',
                content:[{
                    type: 'component',
                    componentName: 'Filesystem',
                    componentState: { label: 'Filesystem' },
                    title: 'Filesystem',
                    id: "aFilesystem"
                },{
                    type: 'component',
                    componentName: 'Bitmap Builder',
                    componentState: { label: 'Bitmap Builder' },
                    close: false,
                    title: 'Bitmap Builder',
                    id: "aBitmapBuilder"
                }]
            },{
                type: 'column',
                id: "Editor",
                content:[{
                    type: 'component',
                    componentName: 'Editor',
                    componentState: { label: 'Editor', editor: undefined},
                    title: 'Editor',
                    id: "aEditor"
                }]
            },{
                type: 'column',
                content:[{
                    type: 'component',
                    componentName: 'Shell',
                    componentState: { label: 'Shell' },
                    title: 'Shell',
                    id: "aShell"
                },{
                    type: 'component',
                    componentName: 'Emulator',
                    componentState: { label: 'Emulator' },
                    title: 'Emulator',
                    id: "aEmulator"
                }]
            }]
        }]
    }]
};


function invertPageTheme(){
    // https://stackoverflow.com/questions/2024486/is-there-an-easy-way-to-reload-css-without-reloading-the-page/43161591#43161591
    var links = document.getElementsByTagName("link");
    for (var cl in links){
        var link = links[cl];
        if (link.rel === "stylesheet"){
            var href = link.href.substring(link.href.lastIndexOf("/") + 1);

            if(href == "main-dark.css"){
                link.href = "css/light/main-light.css";
                document.getElementById("logo").src = "css/thumby_logo-dark.png";
                for (const [id, editor] of Object.entries(EDITORS)) {
                    editor.setThemeLight();
                }
                localStorage.setItem("lastTheme", "light");
                window.theme = "light";
            }else if(href == "main-light.css"){
                link.href = "css/dark/main-dark.css";
                document.getElementById("logo").src = "css/thumby_logo-light.png";
                for (const [id, editor] of Object.entries(EDITORS)) {
                    editor.setThemeDark();
                }
                localStorage.setItem("lastTheme", "dark");
                window.theme = "dark";
            }

            if(href == "editor-dark.css"){
                link.href = "css/light/editor-light.css";
            }else if(href == "editor-light.css"){
                link.href = "css/dark/editor-dark.css";
            }

            if(href == "importer-dark.css"){
                link.href = "css/light/importer-light.css";
            }else if(href == "importer-light.css"){
                link.href = "css/dark/importer-dark.css";
            }

            if(href == "uikit-dark.css"){
                link.href = "uikit-3.7.3/css/uikit-light.css";
            }else if(href == "uikit-light.css"){
                link.href = "uikit-3.7.3/css/uikit-dark.css";
            }

            if(href == "shell-dark.css"){
                link.href = "css/light/shell-light.css";
                ATERM.setLightTheme();
            }else if(href == "shell-light.css"){
                link.href = "css/dark/shell-dark.css";
                ATERM.setDarkTheme();
            }

            if(href == "fs-dark.css"){
                link.href = "css/light/fs-light.css";
            }else if(href == "fs-light.css"){
                link.href = "css/dark/fs-dark.css";
            }

            if(href == "bitmap_builder-dark.css"){
                link.href = "css/light/bitmap_builder-light.css";
            }else if(href == "bitmap_builder-light.css"){
                link.href = "css/dark/bitmap_builder-dark.css";
            }

            if(href == "emulator-dark.css"){
                link.href = "css/light/emulator-light.css";
            }else if(href == "emulator-light.css"){
                link.href = "css/dark/emulator-dark.css";
            }

            if(href == "arcade-dark.css"){
                link.href = "css/light/arcade-light.css";
            }else if(href == "arcade-light.css"){
                link.href = "css/dark/arcade-dark.css";
            }

            if(href == "dir_chooser-dark.css"){
                link.href = "css/light/dir_chooser-light.css";
                ATERM.setLightTheme();
            }else if(href == "dir_chooser-light.css"){
                link.href = "css/dark/dir_chooser-dark.css";
                ATERM.setDarkTheme();
            }

            if(href == "goldenlayout-dark-theme.css"){
                link.href = "golden-layout/css/themes/goldenlayout-light-theme.css";
            }else if(href == "goldenlayout-light-theme.css"){
                link.href = "golden-layout/css/themes/goldenlayout-dark-theme.css";
            }
        }
    }
}


document.getElementById("IDArcadeBTN").onclick = async (event) => {
    ARCADE.show();
}


document.getElementById("IDInvertThemeBTN").onclick = (event) => {
    invertPageTheme();
}


document.getElementById("IDNewGameBTN").onclick = async (event) => {
    var fileName = prompt("Enter a name for the new project's main Python file:", "NewProject.py");
    if(fileName != null && fileName != "" && fileName != undefined){
        var filePath = undefined;

        // Want to use file name as project name, see if it has an extension .py
        var extensionIndex = fileName.indexOf(".py");
        if(extensionIndex != -1){
            filePath = "Games/" + fileName.substring(0, extensionIndex) + "/" + fileName;
        }else{
            filePath = "Games/" + fileName + "/" + fileName;
        }

        // Make sure no editors with this file path already exist
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(editor.EDITOR_PATH == filePath){
                editor._container.parent.focus();
                alert("This file is already open in Editor" + id + "! Please close it first");
                return;
            }
        }

        // Find editor with smallest ID, focus it, then add new editor with file contents
        var currentId = Infinity;
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(id < currentId){
                currentId = id;
            }
        }
        if(currentId != Infinity){
            EDITORS[currentId]._container.parent.focus();
        }

        // Pass the file contents to the new editor using the state
        var state = {};
        state.value = "";
        state.path = filePath;
        myLayout.addComponent('Editor', state, 'Editor');
        await REPL.uploadFile(filePath, "", true, false);
        await REPL.getOnBoardFSTree();
        window.setPercent(100);
        window.resetPercentDelay();
    }
}


document.getElementById("IDDisconnectThumbyBTN").onclick = (event) =>{
    REPL.disconnect();
}


// Reset page by clearing storage and refreshing
document.getElementById("IDHardResetBTN").onclick = (event) =>{
    if(!confirm("Are you sure? This will erase and reset everything about the page (code, bitmap, etc)")){
        return;
    }
    console.log("PAGE: Hard reset page");
    localStorage.clear();

    // Delete database containing all editor binary files
    indexedDB.deleteDatabase("BINARY_FILES");

    // Refresh the page
    location.reload(true);
}

// Add editor panel to layout
document.getElementById("IDAddEditorBTN").onclick = (event) =>{
    console.log("PAGE: +Editor");
    myLayout.addComponent('Editor', undefined, 'Editor');
}

// Add bitmap builder panel to layout
document.getElementById("IDAddBitmapBuilder").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Bitmap Builder: 8 x 8") == false){
        console.log("PAGE: +BitmapBuilder");
        myLayout.addComponent('Bitmap Builder', undefined, 'Bitmap Builder');
    }else{
        alert("Only one bitmap builder can be open");
    }
}

// Add FS panel to layout
document.getElementById("IDAddFS").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Filesystem") == false){
        console.log("PAGE: +Filesystem");
        myLayout.addComponent('Filesystem', undefined, 'Filesystem');
        // REPL.tryAutoConnect();
    }else{
        alert("Only one filesystem can be open");
    }
}

// Add shell panel to layout
document.getElementById("IDAddShell").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Shell") == false){
        console.log("PAGE: +Shell");
        myLayout.addComponent('Shell', undefined, 'Shell');
        // REPL.tryAutoConnect();
    }else{
        alert("Only one shell can be open");
    }
}

// Add emulator panel to layout
document.getElementById("IDAddEmulator").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Emulator") == false){
        console.log("PAGE: +Emulator");
        myLayout.addComponent('Emulator', undefined, 'Emulator');
    }else{
        alert("Only one emulator can be open");
    }
}


// Return true if a panel with this title exists, false otherwise
function recursiveFindTitle(content, title){
    for(var i=0; i < content.length; i++){
        if(content[i].title != undefined && content[i].title == title){
            return true;
        }
        if(content[i].content != undefined){
            if(recursiveFindTitle(content[i].content, title) == true){
                return true;
            }
        }
    }
    return false;
}


// Fill 'editors' with editor panel from every panel with 'editor' in name
function recursiveFindEditors(content, editors){
    for(var i=0; i < content.length; i++){
        if(content[i].title != undefined && content[i].title.indexOf("Editor") != -1){
            editors.push(content[i]);
        }
        if(content[i].content != undefined){
            recursiveFindEditors(content[i].content, editors);
        }
    }
}


// Does a soft reset that repositions all page elements
document.getElementById("IDResetLayoutBTN").onclick = (event) =>{
    console.log("PAGE: reset layout");

    // See if saved layout that may contain open editors exists
    var savedLayout = localStorage.getItem(layoutSaveKey);

    if(savedLayout != null){
        console.log("Restored layout from modified previous state")

        // Convert saved layout to typically config and then get all editor configs
        var savedConfig = LayoutConfig.fromResolved(JSON.parse(savedLayout));
        var rootContent = savedConfig.root.content;
        var allEditors = [];
        recursiveFindEditors(rootContent, allEditors);

        // As long as there are editors open use them in the default config, else use default
        if(allEditors.length > 0){

            // Stop the terminal from resizing and throw an error and add stack for editor tabs
            ATERM.stopAutoResizing();
            var modifiedDefaultConfig = defaultConfig;
            modifiedDefaultConfig.content[0].content[0].content[1].content = [];
            modifiedDefaultConfig.content[0].content[0].content[1].content.push({type: 'stack', id: 'aEditor', content: []});

            // Organize all editors from lowest ID to largest ID and place in stack
            var lastSmallestID = -1;
            var lastSmallestIDedEditor = undefined;
            for(var i=0; i<allEditors.length; i++){
                var currentSmallestId = Infinity;
                for(var j=0; j<allEditors.length; j++){
                    if((allEditors[j].componentState.id > lastSmallestID && allEditors[j].componentState.id < currentSmallestId)){
                        currentSmallestId = allEditors[j].componentState.id;
                        lastSmallestIDedEditor = allEditors[j];
                    }
                }
                lastSmallestID = currentSmallestId;
                modifiedDefaultConfig.content[0].content[0].content[1].content[0].content.push(lastSmallestIDedEditor);
            }

            // Load the new config which will rerun all constructors, and allow the terminal to auto resize again
            myLayout.loadLayout(modifiedDefaultConfig);
            localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() ));
            ATERM.startAutoResizing();
        }else{
            // No open editors, use default layout
            console.log("Restored layout to default state");
            myLayout.loadLayout(defaultConfig);
        }
    }else{
        // No saved layout, use default layout
        console.log("Restored layout to default state");
        myLayout.loadLayout(defaultConfig);
    }
    location.reload();
}


// Setup REPL module
var REPL = new ReplJS();
window.REPL = REPL;


// Filesystem module
var FS = undefined;
function registerFilesystem(_container, state){
    FS = new FILESYSTEM(_container, state);

    DIR.onRename = (path) => REPL.renameFile(path, prompt("Type a new name:", path.substring(path.lastIndexOf("/")+1)));
    DIR.onNewFolder = async (fileOrDir, path) => {
        var newFolderName = prompt("Enter the new folder name:", "NewFolder");
        if(newFolderName != null){
            if(fileOrDir == 1){ // Dir
                await REPL.buildPath(path + "/" + newFolderName);
            }else{              // File
                await REPL.buildPath(path.substring(0, path.lastIndexOf("/")) + "/" + newFolderName);
            }
            await REPL.getOnBoardFSTree();
        }
    }

    FS.onDelete = (path) => REPL.deleteFileOrDir(path);
    FS.onRename = (path) => REPL.renameFile(path, prompt("Type a new name:", path.substring(path.lastIndexOf("/")+1)));
    FS.onFormat = () => REPL.format();
    FS.onUpdate = () => REPL.update();
    FS.onUploadFiles = async () => {
        if(REPL.PORT != undefined){
            console.log("Pick files to upload");
            const fileHandles = await window.showOpenFilePicker({multiple: true});
            if(fileHandles && fileHandles.length > 0){
                var path = await DIR.getPathFromUser(document.body, true);
                if(path != undefined){
                    REPL.uploadFiles(path, fileHandles);
                }
            }
        }else{
            alert("Thumby not connected, can't upload files");
        }
    }
    FS.onRefresh = async () => {
        if(REPL.PORT != undefined){
            window.setPercent(1, "Refreshing filesystem panel");
            await REPL.getOnBoardFSTree();
            window.setPercent(99.8);
            window.resetPercentDelay();
        }else{
            alert("Thumby not connected");
        }
    }
    FS.onOpen = async (filePath) => {
        // Make sure no editors with this file path already exist
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(editor.EDITOR_PATH == filePath){
                editor._container.parent.focus();
                alert("This file is already open in Editor" + id + "! Please close it first");
                return;
            }
        }

        var rawFileBytes = await REPL.getFileContents(filePath);
        if(rawFileBytes == undefined){
            return; // RP2040 was busy
        }

        // Find editor with smallest ID, focus it, then add new editor with file contents
        var currentId = Infinity;
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(id < currentId && id != this.ID){
                currentId = id;
            }
        }
        if(currentId != Infinity){
            EDITORS[currentId]._container.parent.focus();
        }

        // Pass the file contents to the new editor using the state
        var state = {};
        state.value = rawFileBytes;
        state.path = filePath;
        myLayout.addComponent('Editor', state, 'Editor');
    }
    FS.onNewFolder = async (fileOrDir, path) => {
        var newFolderName = prompt("Enter the new folder name:", "NewFolder");
        if(newFolderName != null){
            if(fileOrDir == 1){ // Dir
                await REPL.buildPath(path + "/" + newFolderName);
            }else{              // File
                await REPL.buildPath(path.substring(0, path.lastIndexOf("/")) + "/" + newFolderName);
            }
            await REPL.getOnBoardFSTree();
        }
    }
    FS.onDownloadFiles = async (fullFilePaths) => {
        for(var i=0; i<fullFilePaths.length; i++){
            var startOfFileName = fullFilePaths[i].lastIndexOf('/');
            var fileName = "";
            if(startOfFileName != -1){
                fileName = fullFilePaths[i].substring(startOfFileName+1, fullFilePaths[i].length);
            }else{
                fileName = fullFilePaths[i];
            }

            var fileContents = await REPL.getFileContents(fullFilePaths[i], true);

            window.downloadFileBytes(fileContents, fileName);
        }
    }
}


// Terminal module
var ATERM = undefined;
function registerShell(_container, state){
    ATERM = new ActiveTerminal(_container, state);
    ATERM.onType = (data) => {
        // console.log(data);
        // When the RP2040 is busy with any utility operations where BUSY is set, only allow interrupt key through
        // Allow certain characters through so thumby can pick them up
        if(REPL.BUSY == true){
           return;
        }
        REPL.writeToDevice(data);
        if(EMU.cdc != undefined){
            EMU.cdc.sendSerialByte(data.charCodeAt(0));
        }
    }

    REPL.onData = (data) => ATERM.write(data);
    REPL.onDisconnect = () => {
        ATERM.writeln('\n\r\x1b[1;31m' + "Disconnected" + '\x1b[1;0m');
        ATERM.writeln("Waiting for connection... (click 'Connect Thumby')");
        FS.clearToWaiting();
        FS.removeUpdate();
    }
    REPL.onConnect = () => {
        ATERM.writeln('\x1b[1;32m' + "\n\rConnected" + '\x1b[1;0m');
    }
    REPL.onFSData = (jsonStrData, fsSizeData) => {
        FS.updateTree(jsonStrData);
        FS.updateStorageBar(fsSizeData);
        DIR.updateTree(jsonStrData);
    };
    REPL.doPrintSeparator = () => {
        ATERM.doPrintSeparator();
    }
    REPL.forceTermNewline = () => {
        ATERM.write("\r\n");
    }
    REPL.onShowUpdate = () => {FS.showUpdate()};
}



var EMU;
function registerEmulator(_container, state){
    EMU = new EMULATOR(_container, state, EDITORS);
    EMU.onData = (data) => ATERM.write(data);
}



// Editor module
var EDITORS = {};
var LAST_ACTIVE_EDITOR = undefined; // Each editor will set this to themselves on focus, bitmap builder uses this
function registerEditor(_container, state){
    var editor = new EditorWrapper(_container, state, EDITORS);
    editor.onFocus = () => {LAST_ACTIVE_EDITOR = editor};
    editor.onSaveToThumby = async () => {
        if(editor.EDITOR_PATH == undefined || editor.EDITOR_PATH == ""){
            console.log('Pick a folder');
            var path = await DIR.getPathFromUser(editor._container.element);
            if(path != undefined){
                // Make sure no editors with this file path already exist
                for (const [id, editor] of Object.entries(EDITORS)) {
                    if(editor.EDITOR_PATH == path){
                        editor._container.parent.focus();
                        alert("This file is already open in Editor" + id + "! Please close it first");
                        return;
                    }
                }

                editor.setPath(path);
                editor.setSaved();
                editor.updateTitleSaved();
                editor.onSaveToThumby();
            }
        }else{
            console.log('Saved');
            editor.SAVED_TO_THUMBY = true;
            editor.updateTitleSaved();

            if(editor.isEditorBinary()){
                editor.getDBFile(async (fileData) => {
                    var busy = await REPL.uploadFile(editor.EDITOR_PATH, fileData, true, false);
                    if(busy != true){
                        REPL.getOnBoardFSTree();
                        window.setPercent(100);
                        window.resetPercentDelay();
                    }
                })
            }else{
                var busy = await REPL.uploadFile(editor.EDITOR_PATH, editor.getValue(), true, false);
                if(busy != true){
                    REPL.getOnBoardFSTree();
                    window.setPercent(100);
                    window.resetPercentDelay();
                }
            }
        }
    }
    editor.onSaveAsToThumby = async () => {
        console.log('Pick a folder');
        var path = await DIR.getPathFromUser(editor._container.element);
        if(path != undefined){
            editor.setPath(path);
            editor.setSaved();
            editor.updateTitleSaved();
            editor.onSaveToThumby();
        }
    }
    editor.onFastExecute = async (lines) => {
        REPL.executeLines(lines);
    }
    editor.onEmulate = async (lines) => {
        await EMU.startEmulator(lines);
    }
    EDITORS[editor.ID] = editor;
}


// Setup Bitmap builder module
var BITMAPPER = undefined;
function registerBitmapBuilder(_container, state){
    BITMAPPER = new BITMAP_BUILDER(_container, state);
    BITMAPPER.onExport = (lines) => {
        if(LAST_ACTIVE_EDITOR != undefined){
            LAST_ACTIVE_EDITOR.insert(lines)
        }
    }
    BITMAPPER.onImport = () => {
        if(LAST_ACTIVE_EDITOR != undefined){
            return LAST_ACTIVE_EDITOR.getSelectedText();
        }
    }
}



ARCADE.onDownload = async (thumbyURL, binaryFileContents) => {
    await REPL.uploadFile(thumbyURL, binaryFileContents, false, true);
}

ARCADE.onDoneDownload = async () => {
    await REPL.getOnBoardFSTree();
} 



ARCADE.onOpen = async (arcadeGameFileURLS) => {

    // Uncheck all emulation boxes in all editors
    for (const [id, editor] of Object.entries(EDITORS)) {
        editor.NORMAL_EMU_CHECKBOX.checked = false;
        editor.MAIN_EMU_CHECKBOX.checked = false;
    }

    ARCADE.hide();

    // Loop through each URL for this open
    for(let i=0; i<arcadeGameFileURLS.length; i++){
        // Make URL and path from root
        var thumbyPathAndURL = "/Games/" + arcadeGameFileURLS[i].split('/').slice(6).join('/');

        // Make sure no editors with this file path already exist
        let alreadyOpen = false;
        for (const [id, editor] of Object.entries(EDITORS)) {

            if(editor.EDITOR_PATH == thumbyPathAndURL){
                editor._container.parent.focus();
                alert("This file is already open in Editor" + id + "! Please close it first");
                alreadyOpen = true;
            }
        }

        // If not already open, update percent and get file data
        if(alreadyOpen == false){
            window.setPercent((i/arcadeGameFileURLS.length) * 100, "Opening: " + thumbyPathAndURL);

            // Find editor with smallest ID, focus it, then add new editor with file contents
            var currentId = Infinity;
            for (const [id, editor] of Object.entries(EDITORS)) {
                if(id < currentId){
                    currentId = id;
                }
            }
            if(currentId != Infinity){
                EDITORS[currentId]._container.parent.focus();
            }

            // Get the file contents
            await fetch(arcadeGameFileURLS[i]).then(async (response) => {
                // Pass the file contents to the new editor using the state
                var state = {};
                state.value = Array.from(new Uint8Array(await response.arrayBuffer()));
                state.path = thumbyPathAndURL;

                // When games are opened, check the boxes so emulation can happen right away
                if(thumbyPathAndURL.indexOf(".py") != -1){
                    state.mainChecked = true;
                }else{
                    state.normalChecked = true;
                }

                myLayout.addComponent('Editor', state, 'Editor');
            });
        }
    }
}



// Register Golden layout panels
myLayout.registerComponentConstructor("Bitmap Builder", registerBitmapBuilder);
myLayout.registerComponentConstructor("Filesystem", registerFilesystem);
myLayout.registerComponentConstructor("Editor", registerEditor);
myLayout.registerComponentConstructor("Shell", registerShell);
myLayout.registerComponentConstructor("Emulator", registerEmulator);


// Restore from previous layout if it exists, otherwise default
var savedLayout = localStorage.getItem(layoutSaveKey);
if(savedLayout != null){
    console.log("Restored layout from previous state");
    myLayout.loadLayout(LayoutConfig.fromResolved(JSON.parse( savedLayout )));
}else{
    console.log("Restored layout to default state");
    myLayout.loadLayout(defaultConfig);
}

// Invert theme if last theme was light since dark is default
var lastTheme = localStorage.getItem("lastTheme");
if(lastTheme != undefined && lastTheme != null && lastTheme == "light"){
    invertPageTheme();
}


// Resize layout on browser window resize
window.addEventListener('resize', () => {
    console.log("Window and layout resized");
    myLayout.updateSize(window.width, window.height);
    localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() )); // Save layout to browser every time size/layout changes
});


// Save layout when a component is moved to a new position or one is closed
myLayout.on('stateChanged', function(stack){
    localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() )); // Save layout to browser every time size/layout changes
});


// Run through all editors and focus them since overflow text wrap will happen and make everything ugly.
// Editors should be the only panels with long enough names to cause this problem
for (const [id, editor] of Object.entries(EDITORS)) {
    editor._container.focus();
}


// Used to turn ASCII unto hex string that is typical for Python
// https://stackoverflow.com/questions/33920230/how-to-convert-string-from-ascii-to-hexadecimal-in-javascript-or-jquery/33920309#33920309
// can use delim = '\\x' for Python like hex/byte string (fails for unicode characters)
String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(delim || "");
};


async function downloadFile(filePath, binary) {
    let response = await fetch(filePath);
        
    if(response.status != 200) {
        throw new Error("Server Error");
    }
        
    // read response stream as text
    if(binary == undefined || binary == false){
        return await response.text();
    }else if(binary != undefined && binary == true){
        return new Uint8Array(await response.arrayBuffer());
    }
}
window.downloadFile = downloadFile;


function downloadFileBytes(data, fileName){
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var blob = new Blob([new Uint8Array(data).buffer], {type: "octet/stream"});
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
window.downloadFileBytes = downloadFileBytes;


async function sleep(tenms){

    var tenmsCount = 0;
    
    while (true) {
        tenmsCount = tenmsCount + 1;
        if(tenmsCount >= tenms){
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}
window.sleep = sleep;
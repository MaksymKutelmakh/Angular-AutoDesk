import { Component, ViewChild, OnInit, OnDestroy, ElementRef, Input } from '@angular/core';

 
// We need to tell TypeScript that Autodesk exists as a variables/object somewhere globally
declare const Autodesk: any;
 
@Component({
  selector: 'app-forge-viewer',
  templateUrl: './forge-viewer.component.html',
  styleUrls: ['./forge-viewer.component.css'],
})
export class ForgeViewerComponent implements OnInit, OnDestroy {
  private selectedSection: any = null;
  @ViewChild('viewerContainer',{static: false}) viewerContainer: any;
  private viewer: any;
 
  constructor(private elementRef: ElementRef) { }
 
  ngOnInit() {
  }
 
  ngAfterViewInit() { 
    this.launchViewer();
  }
 
  ngOnDestroy() {
    if (this.viewer && this.viewer.running) {
      this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.selectionChanged);
      this.viewer.tearDown();
      this.viewer.finish();
      this.viewer = null;
    }
  }
 
  private launchViewer() {
    if (this.viewer) {
      return;
    }
 
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: (onSuccess) => { this.getAccessToken(onSuccess) },
    };
 
    this.viewer = new Autodesk.Viewing.Viewer3D(this.viewerContainer.nativeElement, {}); // Headless viewer
    
     this.toolBar = new Autodesk.Viewing.UI.ToolBar('toolBarContainer',options);
    var button1 = new Autodesk.Viewing.UI.Button('show-env-bg-button');
    button1.onClick = function(e) {
        this.viewer.setEnvMapBackground(true);
    };
    button1.addClass('show-env-bg-button');
    button1.setToolTip('Show Environment');
  
    // Button 2
    var button2 = new Autodesk.Viewing.UI.Button('hide-env-bg-button');
    button2.onClick = function(e) {
        this.viewer.setEnvMapBackground(false);
    };
    button2.addClass('hide-env-bg-button');
    button2.setToolTip('Hide Environment');
  
    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
    this.subToolbar.addControl(button1);
    this.subToolbar.addControl(button2);
    console.log(this.subToolbar)
    this.toolBar.addControl(this.subToolbar);
    console.log(this.toolBar)
   
  
    // Check if the viewer has already been initialised - this isn't the nicest, but we've set the env in our
    // options above so we at least know that it was us who did this!
    if (!Autodesk.Viewing.Private.env) {
      Autodesk.Viewing.Initializer(options, () => {
        this.viewer.initialize();
        this.loadDocument();
      });
    } else {
      // We need to give an initialised viewing application a tick to allow the DOM element to be established before we re-draw
      setTimeout(() => {
        this.viewer.initialize();
        this.loadDocument();
      });
    }
  }
 
  private loadDocument() {
    const urn = `urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6a3Z6ZzF6dnhxaWZ2MDFlbmFyZHB3dWF4Y3RqbTRkZzAtbGVhcm4vd29vZGVuLXJvY2tpbmctY2hhaXIuRkJY`;
 
    Autodesk.Viewing.Document.load(urn, (doc) => {
      const geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {type: 'geometry'}, true);
 
      if (geometryItems.length === 0) {
        return;
      }
 
      this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
      this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged(event));
      
      // Choose any of the avialble viewables
      var initialViewable = geometryItems[0];
      var svfUrl = doc.getViewablePath(initialViewable);
      var modelOptions = {
          sharedPropertyDbPath: doc.getPropertyDbPath()
      };
      this.viewer.start(svfUrl, modelOptions);
//       this.viewer.load(doc.getViewablePath(geometryItems[0]));
    }, errorMsg => console.error);
  }
 
  private geometryLoaded(event: any) {
    const viewer = event.target;
 
    viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
    viewer.setLightPreset(8);
    viewer.fitToView();
    viewer.loadExtension('Autodesk.Viewing.ZoomWindow')
    // viewer.setQualityLevel(false, true); // Getting rid of Ambientshadows to false to avoid blackscreen problem in Viewer.
  }
 
  private selectionChanged(event: any) {
    const model = event.model;
    const dbIds = event.dbIdArray;
 
    // Get properties of object
    this.viewer.getProperties(dbIds[0], (props) => {
       // Do something with properties
    });
  }
 
  private getAccessToken(onSuccess: any) {
    const  access_token = "eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJLVlpHMXpWeFFpRlYwMWVOQXJkUHd1QXhjdEptNGRnMCIsImV4cCI6MTU3MDEwNDc5Nywic2NvcGUiOlsidmlld2FibGVzOnJlYWQiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoiNlJtcTQzMlJ1alFoVTBxa01QQndiNmN2c3k4SFBIbkc5UXJyUU9VM1Y4RHhXRW9HZHlVMjVaQ1RPYkZRRkU4ViJ9.5DfaTv-jwrVMX3kj9fl77mi9tcWOqEtRziEpL7QfzqM";
    const expires_in  = 3599;
    onSuccess(access_token, expires_in);
  }
}

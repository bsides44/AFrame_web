/* jshint esversion: 9 */
/* global THREE, AFRAME */
(function() {
    console.log("start ar-cursor")

    "use strict";
    const direction = new THREE.Vector3();
  
    AFRAME.registerComponent("ar-cursor", {
      dependencies: ["raycaster"],
      init() {
        console.log("init ar-cursor raycaster")

        const sceneEl = this.el;
        sceneEl.addEventListener("enter-vr", () => {
          if (sceneEl.is("ar-mode")) {
        console.log("scene is in ar-mode")

            sceneEl.xrSession.addEventListener("select", this.onselect.bind(this));
          }
        });
      },
      onselect(e) {
        console.log("on select cursor")
        const frame = e.frame;
        const inputSource = e.inputSource;
        const referenceSpace = this.el.renderer.xr.getReferenceSpace();
        const pose = frame.getPose(inputSource.targetRaySpace, referenceSpace);
        const transform = pose.transform;
        
        direction.set(0, 0, -1);
        direction.applyQuaternion(transform.orientation);
        this.el.setAttribute("raycaster", {
          origin: transform.position,
          direction
        });
        this.el.components.raycaster.checkIntersections();
        const els = this.el.components.raycaster.intersectedEls;
        for (const el of els) {
          const obj = el.object3D;
          let elVisible = obj.visible;
          obj.traverseAncestors(parent => {
        console.log("checking intersections")

            if (parent.visible === false ) {
              elVisible = false
        console.log("make invisible ")

            }
          });
          if (elVisible) {
        console.log("element is visible")
            
            // Cancel the ar-hit-test behaviours
            this.el.components['ar-hit-test'].hitTest = null;
            this.el.components['ar-hit-test'].bboxMesh.visible = false;
            
            // Emit click on the element for events
            const details = this.el.components.raycaster.getIntersection(el);
            el.emit('click', details);
            
            // Don't go to the next element
            break;
          }
        }
      }
    });
  })();
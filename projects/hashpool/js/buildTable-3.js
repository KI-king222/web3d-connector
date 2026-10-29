/* buildTable Teil 3 */

        moboCaseAnim.mesh.position.y += Math.sin(Math.PI * me) * 0.8;
        moboCaseAnim.mesh.rotation.x = -Math.PI/2 * (1 - me);
        if(mp >= 1){
          moboCaseAnim.mesh.rotation.x = 0;
          spawnScrews("mobo", moboCaseAnim.to);
          moboCaseAnim = null;
        }
      }
      camera3d.position.x += (camTarget.x - camera3d.position.x) * 0.07;
      camera3d.position.y += (camTarget.y - camera3d.position.y) * 0.07;
      camera3d.position.z += (camTarget.z - camera3d.position.z) * 0.07;
      camera3d.lookAt(camera3d.position.x, camTarget.y * 0.3, 0);
      if(autoRotate && !isDragging && !dragActive) rigGroup.rotation.y += 0.0025;
      var pulse = 0.9 + Math.sin(now * 0.003) * 0.4;
      rgbMeshes.forEach(function(m){ if(m.material && m.material.emissiveIntensity!==undefined) m.material.emissiveIntensity = pulse; });
      // spin cooler fan after successful boot
      if(bootPlayed && partMeshes.cooler && partMeshes.cooler.userData.spin){
        partMeshes.cooler.userData.spin.rotation.z += 0.18;
      }
      Object.keys(socketMeshes).forEach(function(key){
        var sm = socketMeshes[key];
        if(!sm.visible) return;
        var active = dragState && dragState.type === "cable" && dragState.id === key;
        var k = active ? 1.5 + Math.sin(now*0.012)*0.2 : 1;
        sm.scale.set(k, k, k);
        sm.userData.halo.material.emissiveIntensity = active ? 2.6 : 0.7 + Math.sin(now*0.004)*0.4;
      });
      renderer3d.render(scene3d, camera3d);
    }
    tick();
  }

let sidebar_width = 300;
const sidebar_min_width = 150;
const sidebar_max_width = 600;

let lastX = 0;

let observer = new MutationObserver(function (mutations, observer) {
    mutations.forEach((mutation) => {
		if(mutation.type == 'childList') {
			mutation.addedNodes.forEach((addedNode) => {
				if(addedNode.classList){
					if(addedNode.classList.contains("script-application-sidebar")) {
						injectContent(addedNode);
						observer.disconnect();
					}
				}
			});
		}	
	});
});

observer.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });

async function injectContent(target){
    let response = await fetch(chrome.runtime.getURL("toggle.html")); 
    target.insertAdjacentHTML("beforeend", await response.text());
	document.getElementById("extension-addon-sidebar-modifier-toggle").addEventListener("click", toggle);
    resizer_setup();
}

function resizer_setup(){	
	let sidebar = document.getElementsByClassName("script-application-sidebar")[0];
	sidebar.style.zIndex = 99;
	let sidebar_content = document.getElementsByClassName("script-application-sidebar-content")[0];
	let resizer = document.getElementById("extension-addon-sidebar-modifier-resizer");

	function resize(e){
		var change = lastX - e.pageX;
		lastX = e.pageX;
	
		sidebar_width = sidebar_width + change;
		
		if(sidebar_width < sidebar_min_width){
			sidebar_width = sidebar_min_width;
		}else if(sidebar_width > sidebar_max_width){
			sidebar_width = sidebar_max_width;
		}
		
		sidebar.style.width = sidebar_width + "px";
		
		updateWidthAll(sidebar_width);
	}

	resizer.addEventListener("mousedown", function(e){
		lastX = e.pageX;
		sidebar_content.style.pointerEvents = "none";
		document.addEventListener("mousemove", resize, false);
	}, false);
	
	document.addEventListener("mouseup", function(){
		sidebar_content.style.pointerEvents = "auto";
		document.removeEventListener("mousemove", resize, false);
	}, false);
}
function toggle(){
	var cur_sidebar_width = parseInt(getComputedStyle(document.getElementsByClassName("script-application-sidebar")[0], '').width);
	let resizer = document.getElementById("extension-addon-sidebar-modifier-resizer");
	
	if(cur_sidebar_width > 0){
		//Hide sidebar
		sidebar_width = cur_sidebar_width;
		
		document.getElementsByClassName("script-application-sidebar")[0].style.width = "0px";
		document.getElementsByClassName("script-application-sidebar-header")[0].style.display = "none";
		
		resizer.style.display = "none";
		
		//I could not force page to resize so we have to manually change the sizes
		//It's not perfect but is ok
		updateWidthAll(sidebar_width);
	} else {
		//Show sidebar
		document.getElementsByClassName("script-application-sidebar")[0].style.width = sidebar_width + "px";
		document.getElementsByClassName("script-application-sidebar-header")[0].style.display = "block";
		
		resizer.style.display = "block";
		
		updateWidthAll(-sidebar_width);
	}
}

function updateWidthAll(val){
	updateWidth("docs-editor", val);
	updateWidth("docs-toolbar-wrapper", val);
	updateWidth("docs-additional-bars", val);
	updateRightByClass("kix-scrollbarwidget", -val);
	updateMaxWidth("docs-primary-toolbars", val);
}
function updateWidth(id, val){
	var elem = document.getElementById(id);
	if(elem){
		var prev_width = parseInt(getComputedStyle(elem, '').width);
		prev_width = prev_width + val;
		elem.style.width = prev_width + 'px';
	}
}

function updateRightByClass(classname, val){
	if(document.getElementsByClassName(classname)[0]){
		var obj = document.getElementsByClassName(classname)[0];
		var prev_right = parseInt(obj.style.right);
		prev_right = prev_right + val;
		obj.style.right = prev_right+ 'px';
	}
}	
	
function updateMaxWidth(id, val){
	var elem = document.getElementById(id);
	if(elem){
		var prev_width = parseInt(getComputedStyle(elem, '').maxWidth);
		prev_width = prev_width + val;
		elem.style.maxWidth = prev_width + 'px';
	}
}
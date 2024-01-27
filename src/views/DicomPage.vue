<script>
import { RenderingEngine, Enums } from "@cornerstonejs/core";
import {
  ToolGroupManager,
  addTool,
  DragProbeTool,
  ProbeTool,
  ZoomTool,
  MagnifyTool,
  PanTool,
  LengthTool,
  StackScrollMouseWheelTool,
  BidirectionalTool,
  RectangleROITool,
  EllipticalROITool,
  AngleTool,
  ArrowAnnotateTool,
  CobbAngleTool,
  Enums as csToolsEnums,
} from "@cornerstonejs/tools";
import {
  initDemo,
  createImageIdsAndCacheMetaData,
} from "@/composables/helpers";
export default {
  data: () => ({
    ctToolGroup: null,
    currentImage: 1,
    general: [
      {
        icon: "mdi-magnify",
        title: "Magnify Tool",
        value: MagnifyTool.toolName,
        tool: MagnifyTool,
      },
      {
        icon: "mdi-magnify-plus",
        title: "Zoom Tool",
        value: ZoomTool.toolName,
        tool: ZoomTool,
      },
      {
        icon: "mdi-plus",
        title: "Stack Scroll Mouse wheel Tool",
        value: StackScrollMouseWheelTool.toolName,
        tool: StackScrollMouseWheelTool,
      },
      {
        icon: "mdi-cursor-move",
        title: "Pan Tool",
        value: PanTool.toolName,
        tool: PanTool,
      },
    ],
    annotation: [
      {
        title: "Angle Tool",
        value: AngleTool.toolName,
        tool: AngleTool,
      },
      {
        title: "Arrow Annotate Tool",
        value: ArrowAnnotateTool.toolName,
        tool: ArrowAnnotateTool,
      },
      {
        title: "Cobb Angle Tool",
        value: CobbAngleTool.toolName,
        tool: CobbAngleTool,
      },
      {
        title: "Drag Probe Tool",
        value: DragProbeTool.toolName,
        tool: DragProbeTool,
      },
      { title: "Probe Tool", value: ProbeTool.toolName, tool: ProbeTool },
      { title: "Length Tool", value: LengthTool.toolName, tool: LengthTool },
      {
        title: "Bidirectional Tool",
        value: BidirectionalTool.toolName,
        tool: BidirectionalTool,
      },
      {
        title: "RectangleRoi Tool",
        value: RectangleROITool.toolName,
        tool: RectangleROITool,
      },
      {
        title: "Ellipse Tool",
        value: EllipticalROITool.toolName,
        tool: EllipticalROITool,
      },
    ],
    imageIds: [],
    viewport: null,
    currentTool: "",
    StudyInstanceUID: '',
    SeriesInstanceUID: ''
  }),
  async mounted() {
    this.StudyInstanceUID = this.$route.query.studyUID;
    this.SeriesInstanceUID = this.$route.query.seriesUID;
    try {
      await initDemo();
      const { ViewportType } = Enums;
      this.imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID: this.StudyInstanceUID,
        SeriesInstanceUID: this.SeriesInstanceUID,
        // rootUrl: "http://127.0.0.1:4200/api/dicom/wado?requestType=WADO",
        wadoRsRoot: "http://127.0.0.1:4200/dicom-web",
      });
      // console.log("imageIds----: ", this.imageIds);
      // Final code
      const content = document.getElementById("content");
      const element = document.createElement("div");
      element.style.width = "100%";
      element.style.height = "500px";

      content.appendChild(element);

      const renderingEngineId = "myRenderingEngine";
      const viewportId = "CT_AXIAL_STACK";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      const viewportInput = {
        viewportId,
        element,
        type: ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);

      this.viewport = renderingEngine.getViewport(viewportInput.viewportId);

      this.viewport.setStack(this.imageIds);

      this.viewport.render();

      this.general.forEach(function (item) {
        addTool(item.tool);
      });

      this.annotation.forEach(function (item) {
        addTool(item.tool);
      });

      const toolGroupId = "ctToolGroup";
      this.ctToolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // Add tools to ToolGroup
      // Manipulation tools
      this.general.forEach((item) => {
        this.ctToolGroup.addTool(item.value);
      });

      this.annotation.forEach((item) => {
        this.ctToolGroup.addTool(item.value);
      });

      this.ctToolGroup.addViewport(viewportId, renderingEngineId);
    } catch (error) {
      console.log("error: ", error);
    }
  },
  methods: {
    async getImageFromUrl(url) {
      try {
        const res = await fetch(url.replace("wadors:", ""));
        const data = await res.blob();
        // console.log(data, "-", URL.createObjectURL(data));
        return URL.createObjectURL(data);
      } catch (error) {
        console.log("blob fetch error: ", error);
        return "https://cdn2.iconfinder.com/data/icons/prohibited-forbidden-signs/100/Prohibited-01-512.png";
      }
    },
    openNewPath(index){
      let url = 'http://localhost:8080/bluelight/html/start.html'
      if(index === 0) {
        url = url + `?StudyInstanceUID=${this.StudyInstanceUID}`
      }else {
        url = url + `?StudyInstanceUID=${this.StudyInstanceUID}&SeriesInstanceUID=${this.SeriesInstanceUID}`
      }
      window.open(url)
    },
    setImage(index) {
      this.currentImage = index+1
      this.viewport.setStack(this.imageIds, index);
    },
    universalTool(toolName) {
      this.disableTool();
      this.ctToolGroup.setToolActive(toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });
      this.currentTool = toolName;
    },
    disableTool() {
      if(this.currentTool.length){
        this.ctToolGroup.setToolDisabled(this.currentTool);
      }
    },
  },
};
</script>
<template>
  <div>
    <v-col md="12" class="mx-auto h-screen pr-0">
      <v-row no-gutters>
        <v-col md="3" class="d-flex flex-column justify-space-between px-0">
          <div>
            <p class="font-weight-bold text-body-2">
              Image Index Numbers
            </p>
            <div class="mb-1 __fixed_height" style="width: 100%;">
            <v-btn v-for="(data, i) in imageIds" :key="i" class="ma-2" size="x-small" :color="(currentImage === (i+1))?'blue':'white'" @click="setImage(i)">
              {{ i + 1 }}
            </v-btn>
          </div>
          </div>
          <div class="bg-blue-darken-4">
            <v-row no-gutters>
              <v-tooltip
                v-for="(tool, i) in general"
                :key="i"
                :text="tool.title"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    @click="universalTool(tool.value)"
                    size="small"
                    :icon="tool.icon"
                    rounded="0"
                    variant="text"
                  />
                </template>
              </v-tooltip>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="small"
                    icon="mdi-format-annotation-plus"
                    rounded="0"
                    variant="text"
                  />
                </template>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in annotation"
                    :key="index"
                    :value="index"
                    @click="universalTool(item.value)"
                  >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="small"
                    icon="mdi-exit-run"
                    rounded="0"
                    variant="text"
                  />
                </template>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in ['Open Study', 'Open Series']"
                    :key="index"
                    :value="index"
                    @click="openNewPath(index)"
                  >
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-row>
          </div>
        </v-col>
        <v-col>
          <div class="c" id="content"></div>
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>
<style scoped>
.box_image {
  width: 100%;
  height: 100px;
  background-color: rgb(0, 0, 0);
}
.__fixed_height {
  height: 300px;
  overflow-y: scroll;
}
</style>

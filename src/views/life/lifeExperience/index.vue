<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="起止日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['life:lifeExperience:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['life:lifeExperience:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:lifeExperience:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['life:lifeExperience:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          :disabled="single"
          @click="handleLifeArchives"
          v-hasPermi="['life:lifeArchives:create']"
        >同步档案</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="lifeExperienceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="旅行地图">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleTransferMapStat(row)"><i class="el-icon-map-location" /></span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="天数" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.days }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行程明细" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetailList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.cost) }}</span>
          <span class="link-type" @click="handleCostStat(row)"><i class="el-icon-money" /></span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.startDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['life:lifeExperience:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:lifeExperience:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="经历名称" prop="name">
             <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="地点名称" prop="lcName">
             <el-input v-model="form.lcName" placeholder="请输入地点名称" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="地理坐标" prop="location">
             <el-input v-model="form.location" placeholder="" style="width: 170px;"/>
             <el-button type="query" icon="el-icon-search" size="mini" @click="handleMapLocation()" >选择</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经历类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="类型"
                collapse-tags
                size="small"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="dict in typesFormOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker type="date" v-model="form.startDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker type="date" v-model="form.endDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable  @change="calculateMinutes">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="持续天数" prop="days">
             <el-input-number v-model="form.days" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="花费金额" prop="cost">
             <el-input-number v-model="form.cost" :style="{width: '100%'}" disabled placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="经历标签" prop="tags">
              <el-tag
                :key="tag"
                v-for="tag in keywordsTags"
                closable
                :disable-transitions="false"
                @close="handleTagClose(tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 新建</el-button>
              <el-popover
                  placement="bottom"
                  title="请选择"
                  width="500"
                  trigger="click">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in hisKeywordsTags"
                    :disable-transitions="false"
                    @click="handleTagAppend(tag)">
                    {{tag}}
                  </el-tag>
                  <el-button slot="reference" type="success" size="mini" round>选择</el-button>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


    <!-- 花费统计页面 -->
    <el-dialog :title="costStatTitle" width="800px" :visible.sync="costStatVisible"  append-to-body>
      <life-experience-cost-stat
        :lifeExpData="lifeExpData"
      />
    </el-dialog>

    <!-- 地图统计页面 -->
    <el-dialog :title="transferMapStatTitle" width="900px" :visible.sync="transferMapStatVisible"  append-to-body>
      <life-experience-transfer-map-stat
        :lifeExpData="lifeExpData"
      />
    </el-dialog>

    <!-- 明细列表页面 -->
    <el-dialog :title="detailListTitle" width="850px" :visible.sync="detailListVisible"  append-to-body>
      <life-experience-detail-list
        :lifeExpData="lifeExpData"
      />
    </el-dialog>

    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>

    <!-- 位置的地理位置选择页面 -->
    <el-dialog :title="mapLocTitle" width="850px" :visible.sync="mapLocOpen"  append-to-body>
      <el-input v-model="addressKeyword" placeholder="请输入地址来直接查找相关位置"></el-input>
      <baidu-map class="bmView" ak="M34ic6nt1BNTfxK0wEiZnPWzEt6Xfgqe" :scroll-wheel-zoom="true" :center="centerLocation" @click="getLocationPoint" :zoom="15">
        <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT"></bm-city-list>
        <bm-view style="width: 100%; height:500px; flex: 1"></bm-view>
        <bm-marker :position="currentLocation" :dragging="true" animation="BMAP_ANIMATION_BOUNCE">
          <bm-label :content="currentName" :labelStyle="{color: 'red', fontSize : '24px'}" :offset="{width: -35, height: 30}"/>
        </bm-marker>
        <bm-local-search :keyword="addressKeyword" :auto-viewport="true" style="display: none"></bm-local-search>
      </baidu-map>
        <el-row>
          <el-col :span="11">
            <el-input v-model="address"/>
          </el-col>
          <el-col :span="11">
              <el-input v-model="geoPoint"/>
          </el-col>
          <el-col :span="2">
              <el-button type="success" icon="el-icon-check" size="mini" @click="confirmLocationPoint" >确定</el-button>
          </el-col>
        </el-row>

    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getLifeExperience,createLifeExperience,updateLifeExperience,deleteLifeExperience} from "@/api/life/lifeExperience";
  import {deepClone} from "@/utils/index";
  import {appendTagToOptions} from "@/utils/tagUtils";
  import LifeExperienceCostStat from './costStat'
  import {dateDiff} from "@/utils/datetime";
  import LifeExperienceTransferMapStat from './transferMapByLifeExpStat'
  import LifeExperienceDetailList from '../lifeExperienceDetail/index'
  import {dispatchCommonStat} from "@/utils/planUtils";
  import LifeArchivesDetail from '../../life/lifeArchives/detail'
  import {BaiduMap,BmNavigation,BmView,BmCityList,BmMarker,BmLabel} from 'vue-baidu-map'
  import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch.vue'

export default {
  name: "LifeExperience",
  components: {
    BaiduMap,
    BmView,
    BmCityList,
    BmLocalSearch,
    BmMarker,
    BmLabel,
    'life-experience-cost-stat':LifeExperienceCostStat,
    'life-experience-transfer-map-stat':LifeExperienceTransferMapStat,
    'life-experience-detail-list':LifeExperienceDetailList,
    'life-archives-detail':LifeArchivesDetail
  },
  data() {
    return {
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      //外部页面数据
      lifeExpData:{
        lifeExperienceId:undefined
      },
      //花费统计属性start
      costStatTitle:'',
      costStatVisible:false,
      //花费统计属性end
      //地图统计属性start
      transferMapStatTitle:'',
      transferMapStatVisible:false,
      //地图统计属性end
      //明细列表属性start
      detailListTitle:'',
      detailListVisible:false,
      //明细列表属性end
      //地理位置选择
      mapLocTitle:'',
      mapLocOpen:false,
      addressKeyword:undefined,
      //中心位置
      centerLocation:'杭州',
      //当前位置
      currentLocation:'杭州',
      currentName:'',
      address:undefined,
      geoPoint:undefined,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      lifeExperienceList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      typesOptions: [],
      typesFormOptions: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        startDate: [
          { required: true, message: "开始日期不能为空", trigger: "blur" }
        ],
        endDate: [
          { required: true, message: "结束日期不能为空", trigger: "blur" }
        ],
        days: [
          { required: true, message: "天数不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('ExperienceType','ORDINAL',false).then(response => {
      this.typesOptions = response;
    });
    this.getEnumTree('ExperienceType','FIELD',false).then(response => {
      this.typesFormOptions = response;
    });
    this.getTagsTreeselect();
  },
  methods: {
    /** 地理位置选择 */
    handleMapLocation(){
      if(this.form.lcName==null){
        this.msgError('请先输入地点名称');
        return;
      }
      this.mapLocTitle ="地理位置选择";
      this.mapLocOpen=true;
      this.address=undefined;
      this.geoPoint=undefined;
      this.addressKeyword = this.form.lcName;
      if(this.form.location==null){
        this.centerLocation=this.form.lcName;
      }else{
        let geo = this.form.location.split('');
        this.centerLocation={lng: geo[0], lat: geo[1]};
        this.currentLocation={lng: geo[0], lat: geo[1]};
        this.geoPoint =this.form.location;
      }
      this.currentName = '当前位置：'+this.form.lcName;
    },
    /** 获取坐标 */
    getLocationPoint(e){
      let lng = e.point.lng;
      let lat = e.point.lat;
      this.geoPoint = lng+','+lat;
      //用所定位的经纬度查找所在地省市街道等信息
      let point = new BMap.Point(e.point.lng, e.point.lat);
      let gc = new BMap.Geocoder();
      let _this = this;
      gc.getLocation(point, function (rs) {
          let addComp = rs.addressComponents;
          //地址信息
          _this.address = rs.address;
      });
    },
    /** 确认坐标 */
    confirmLocationPoint(){
      this.form.location = this.geoPoint;
      this.mapLocOpen=false;
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getLifeExperience(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'人生经历信息',
          content:response.name,
          date:response.startDate+' 00:00:00',
          bussType:'LIFE_EXPERIENCE',
          relatedBeans:'LifeExperience',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 标签处理 start */
    handleTagClose(tag){
      this.keywordsTags.splice(this.keywordsTags.indexOf(tag), 1);
    },
    handleTagAppend(tag) {
      appendTagToOptions(tag,this.keywordsTags);
    },
    showTagInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleTagInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        appendTagToOptions(inputValue,this.keywordsTags);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    /** 标签处理 end */
    /** 查询人生经历标签下拉树结构 */
    getTagsTreeselect() {
      this.getDictItemTree('LIFE_EXPERIENCE_TAGS',false).then(response => {
        if(!this.isObjectEmpty(response)){
          for(var j =0;j<response.length;j++){
            this.hisKeywordsTags.push(response[j].id);
          }
        }
      });
    },
    /** 花费统计 */
    handleCostStat(row){
      this.costStatTitle='花费统计';
      this.costStatVisible=true;
      this.lifeExpData = Object.assign({}, this.lifeExpData, {
        lifeExperienceId: row.id
      });
    },
    /** 地图统计 */
    handleTransferMapStat(row){
      this.transferMapStatTitle='花费统计';
      this.transferMapStatVisible=true;
      this.lifeExpData = Object.assign({}, this.lifeExpData, {
        lifeExperienceId: row.id
      });
    },
    /** 明细列表 */
    handleDetailList(row){
      this.detailListTitle='['+row.name+']明细列表';
      this.detailListVisible=true;
      this.lifeExpData = Object.assign({}, this.lifeExpData, {
        lifeExperienceId: row.id
      });
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('LifeExperience',this.$router);
    },
    //计算时长
    calculateMinutes(){
      let startDate=this.form.startDate;
      let endDate =this.form.endDate;
      let days = dateDiff(startDate,endDate)+1;
      this.form.days=days;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.types!=null){
        acQueryParams.types = acQueryParams.types.join(',');
      }
      fetchList(acQueryParams).then(
        response => {
          this.lifeExperienceList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        orderIndex: 0,
        status: "ENABLE",
        statable:true,
        tags:null,
        lcName:undefined,
        location:undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.keywordsTags = [];
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getLifeExperience(id).then(response => {
        this.form = response;
        if(!this.isObjectEmpty(response.tags)){
          this.keywordsTags = response.tags.split(',');
        }else{
          this.keywordsTags = [];
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.keywordsTags.length>0){
            this.form.tags = this.keywordsTags.join(',');
          }else{
            this.form.tags = undefined;
          }
          if (this.form.id != undefined) {
            updateLifeExperience(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createLifeExperience(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteLifeExperience(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportLifeExperience(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

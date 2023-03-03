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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperienceDetail:query']">搜索</el-button>
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
          v-hasPermi="['life:lifeExperienceDetail:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['life:lifeExperienceDetail:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:lifeExperienceDetail:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['life:lifeExperienceDetail:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="lifeExperienceDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出发城市" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.startCity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抵达城市" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.arriveCity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.cost) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费明细" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleConsumeList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="地图绘制" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.mapStat" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" width="110">
        <template slot-scope="{row}">
          <span>{{ row.occurDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center"  width="110">
        <template slot-scope="{row}">
          <span>{{ row.country }}</span>
        </template>
      </el-table-column>
      <el-table-column label="省份" align="center">
        <template slot-scope="{row}">
          <span>{{ row.provinceId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="城市" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cityId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="县(地区)" align="center">
        <template slot-scope="{row}">
          <span>{{ row.districtId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['life:lifeExperienceDetail:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:lifeExperienceDetail:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="10">
            <el-form-item label="出发城市" prop="startCity">
             <el-input v-model="form.startCity" placeholder="请输入城市" @blur="getStartCityLocation" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="地理坐标" prop="scLocation">
             <el-input v-model="form.scLocation" placeholder="" style="width: 195px;"/>
             <el-button type="query" icon="el-icon-check" size="mini" @click="handleStartCityML" >选择</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="抵达城市" prop="arriveCity">
             <el-input v-model="form.arriveCity" placeholder="请输入城市" @blur="getArriveCityLocation" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="地理坐标" prop="acLocation">
             <el-input v-model="form.acLocation" placeholder="" style="width: 195px;"/>
             <el-button type="query" icon="el-icon-check" size="mini" @click="handleArriveCityML" >选择</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="所在国家" prop="country">
             <el-input v-model="form.country" placeholder="请输入国家" @blur="getCountryLocation" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="地理坐标" prop="countryLocation">
             <el-input v-model="form.countryLocation" placeholder="" style="width: 195px;"/>
             <el-button type="query" icon="el-icon-check" size="mini" @click="handleCountryML" >选择</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="出发日期" prop="occurDate">
              <el-date-picker type="date" v-model="form.occurDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '225px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="地图统计" prop="mapStat">
              <el-switch v-model="form.mapStat"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="国际线路" prop="international">
              <el-switch v-model="form.international"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="省市信息" prop="provinceId">
              <el-select
                v-model="form.provinceId"
                placeholder="省份"
                collapse-tags
                size="medium"
                :style="{width: '170px'}"
                @change="getCityTreeselect"
              >
                <el-option
                  v-for="dict in provinceOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
              <el-select
                v-model="form.cityId"
                placeholder="城市"
                collapse-tags
                size="medium"
                :style="{width: '175px'}"
                @change="getDistrictTreeselect"
              >
                <el-option
                  v-for="dict in cityOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
              <el-select
                v-model="form.districtId"
                placeholder="县城"
                collapse-tags
                size="medium"
                :style="{width: '175px'}"
              >
                <el-option
                  v-for="dict in districtOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
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

    <!-- 消费列表页面 -->
    <el-dialog :title="consumeListTitle" width="850px" :visible.sync="consumeListVisible"  append-to-body>
      <life-experience-consume-list
        :detailForConsumeListData="detailForConsumeListData"
      />
    </el-dialog>

    <!-- 位置的地理位置选择页面 -->
    <el-dialog :title="mapLocTitle" width="850px" :visible.sync="mapLocOpen"  append-to-body>
      <location-select :locationData="locationData" @closeMe="mapLocOpen=false" @confirmLocation="confirmLocation"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getLifeExperienceDetail,createLifeExperienceDetail,
  updateLifeExperienceDetail,deleteLifeExperienceDetail,getCountryLocation,getCityLocation} from "@/api/life/lifeExperienceDetail";
  import {getAllProvince,getCityList,getDistrictList} from "@/api/common";
  import LifeExperienceConsumeList from '../lifeExperienceConsume/index'
  import LocationSelect from '../lifeExperience/locationSelect'

export default {
  name: "LifeExperienceDetail",
  components: {
    'life-experience-consume-list':LifeExperienceConsumeList,
    'location-select':LocationSelect
  },
  props: {
    //父层带过来的账户信息值
    lifeExpData:{
      lifeExperienceId:undefined
    }
  },
  data() {
    return {
      //消费列表属性start
      consumeListTitle:'',
      consumeListVisible:false,
      detailForConsumeListData:{
        lifeExperienceDetailId:undefined
      },
      //消费列表属性end
      //地理位置选择
      mapLocTitle:'',
      mapLocOpen:false,
      locationField:'startCity',
      locationData: {
        name: undefined,
        location: undefined
      },
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
      lifeExperienceDetailList:[],
      //省市县
      provinceOptions:[],
      cityOptions:[],
      districtOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
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
        country: [
          { required: true, message: "国家不能为空", trigger: "blur" }
        ],
        // provinceId: [
        //   { required: true, message: "省份不能为空", trigger: "blur" }
        // ],
        // cityId: [
        //   { required: true, message: "城市不能为空", trigger: "blur" }
        // ],
        occurDate: [
          { required: true, message: "出发日期不能为空", trigger: "blur" }
        ],
        startCity: [
          { required: true, message: "出发城市不能为空", trigger: "blur" }
        ],
        arriveCity: [
          { required: true, message: "抵达城市不能为空", trigger: "blur" }
        ],
        scLocation: [
          { required: true, message: "出发城市地理坐标不能为空", trigger: "blur" }
        ],
        acLocation: [
          { required: true, message: "抵达城市地理坐标不能为空", trigger: "blur" }
        ],
        mapStat: [
          { required: true, message: "请选择是否加入地图统计", trigger: "blur" }
        ],
        international: [
          { required: true, message: "请选择是否国际线路", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.lifeExpData);
  },
  //监听父层带过来的账户信息值
  watch:{
    lifeExpData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 查询省份下拉树结构 */
    getProvinceTreeselect() {
      getAllProvince().then(response => {
        this.provinceOptions = response;
      });
    },
    /** 查询城市下拉树结构 */
    getCityTreeselect(provinceId) {
      this.districtOptions=[];
      getCityList(provinceId).then(response => {
        this.cityOptions = response;
      });
    },
    /** 查询县级下拉树结构 */
    getDistrictTreeselect(cityId) {
      getDistrictList(cityId).then(response => {
        this.districtOptions = response;
      });
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.lifeExperienceId=data.lifeExperienceId;
      this.getList();
    },
    /** 消费列表 */
    handleConsumeList(row){
      this.consumeListTitle='['+row.occurDate+':'+row.startCity+'~'+row.arriveCity+']消费列表';
      this.consumeListVisible=true;
      this.detailForConsumeListData = Object.assign({}, this.detailForConsumeListData, {
        lifeExperienceDetailId: row.id
      });
    },
    /** 自动获取出发城市的地理位置 */
    getStartCityLocation(){
      getCityLocation(this.form.startCity).then(
        response => {
          if(response!=null){
            this.form.scLocation=response;
          }
        }
      );
    },
    /** 自动获取抵达城市的地理位置 */
    getArriveCityLocation(){
      getCityLocation(this.form.arriveCity).then(
        response => {
          if(response!=null){
            this.form.acLocation=response;
          }
        }
      );
    },
    /** 自动获取国家的地理位置 */
    getCountryLocation(){
      if(this.form.country!='中国'){
        this.form.international = true;
      }
      getCountryLocation(this.form.country).then(
        response => {
          if(response!=null){
            this.form.countryLocation=response;
          }
        }
      );
    },
    /** 开始城市地理位置选择 */
    handleStartCityML(){
      this.mapLocTitle ="地理位置选择";
      this.mapLocOpen=true;
      this.locationField='startCity';
      this.locationData={
        name:this.form.startCity,
        location:this.form.scLocation
      }
    },
    /** 抵达城市地理位置选择 */
    handleArriveCityML(){
      this.mapLocTitle ="地理位置选择";
      this.mapLocOpen=true;
      this.locationField='arriveCity';
      this.locationData={
        name:this.form.arriveCity,
        location:this.form.acLocation
      }
    },
    /** 国家地理位置选择 */
    handleCountryML(){
      this.mapLocTitle ="地理位置选择";
      this.mapLocOpen=true;
      this.locationField='country';
      this.locationData={
        name:this.form.country,
        location:this.form.countryLocation
      }
    },
    /** 确认坐标 */
    confirmLocation(data){
      switch(this.locationField){
        case 'startCity':
          this.form.scLocation = data.location;
          break;
        case 'arriveCity':
          this.form.acLocation = data.location;
          break;
        case 'country':
          this.form.countryLocation = data.location;
          break;
        default:
          this.msgError('无法确定编辑信息');
      }
      this.mapLocOpen=false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.lifeExperienceDetailList = response.rows;
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
        country: '中国',
        countryLocation: '116.266206,41.034901',
        mapStat:true,
        international:false,
        scLocation:undefined,
        acLocation:undefined
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
      if(this.isObjectEmpty(this.queryParams.lifeExperienceId)){
        this.msgError('没有人生经历信息，无法新增');
        return;
      }
      this.reset();
      this.form.lifeExperienceId = this.queryParams.lifeExperienceId;
      this.getProvinceTreeselect();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getProvinceTreeselect();
      const id = row.id || this.ids.join(",")
      getLifeExperienceDetail(id).then(response => {
        this.form = response;
        this.form.lifeExperienceId = response.lifeExperience.id;
        this.getCityTreeselect(response.provinceId);
        this.getDistrictTreeselect(response.cityId);
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLifeExperienceDetail(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createLifeExperienceDetail(this.form).then(response => {
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
          return deleteLifeExperienceDetail(ids);
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
          return exportLifeExperienceDetail(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

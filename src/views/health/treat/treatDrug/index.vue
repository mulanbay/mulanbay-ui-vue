<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="moreCdn==true" label="药品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称检索" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="请输入名称"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
      </el-form-item>
      <el-form-item  v-if="queryParams.treatRecordId==null" label="用药日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="疾病名称" prop="disease">
        <el-select
          v-model="queryParams.disease"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in diseaseOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatDrug:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="createDisable"
          @click="handleCreate"
          v-hasPermi="['health:treat:treatDrug:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:treat:treatDrug:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatDrug:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:treat:treatDrug:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleDetailStat"
          v-hasPermi="['health:treat:treatDrugDetail:stat']"
        >用药统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-date"
          size="mini"
          @click="handleCalendar"
          v-hasPermi="['health:treat:treatDrug:calendar']"
        >用药日历</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatDrugList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="药品名" width="250" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.active == true">
           <el-tag type="danger">用药中</el-tag>
          </span>
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="明细" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleAddDrugDetail(row)"><i class="el-icon-circle-plus"></i></span>
          <el-divider direction="vertical"></el-divider>
          <span class="link-type" @click="handleDetailList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetailCalendarStat(row)"><i class="el-icon-s-data" /></span>
          <el-divider direction="vertical"></el-divider>
          <span class="link-type" @click="handleDetailTimeStat(row)"><i class="el-icon-c-scale-to-original" /></span>
        </template>
      </el-table-column>
      <el-table-column label="频率" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.perDay+'天' }}</span>
          <el-tag type="danger">{{ row.perTimes }}</el-tag>
          次
        </template>
      </el-table-column>
      <el-table-column label="用药量" align="center"  width="140">
        <template slot-scope="{row}">
          <span v-if="null !=row.eu">
           每次
           <el-tag type="danger">{{ row.ec }}</el-tag>
           {{ row.eu }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="使用方式" align="center">
        <template slot-scope="{row}">
          <span>{{ row.useWay }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病日期" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.amount+row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药开始日期" width="110">
        <template slot-scope="{row}">
          <span>{{ row.beginDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药结束日期" width="110">
        <template slot-scope="{row}">
          <span>{{ row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.diagnosedDisease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.unitPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.available" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="提醒" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.remind" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-close"
            @click="handleStop(scope.row)"
            v-if="scope.row.active == true"
            v-hasPermi="['health:treat:treatDrug:edit']"
          >暂停</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            v-if="scope.row.active == false"
            @click="handleReOpen(scope.row)"
            v-hasPermi="['health:treat:treatDrug:edit']"
          >启用</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatDrug:delete']"
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

    <!-- 表单页面 -->
    <el-dialog :title="title" width="720px" :visible.sync="open"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="药品名称" prop="name">
                <el-select
                  v-model="form.name"
                  filterable
                  allow-create
                  default-first-option
                  :style="{width: '100%'}"
                  @change="loadProperties"
                  >
                  <el-option
                    v-for="dict in nameOptions"
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
              <el-form-item label="针对疾病" prop="disease">
                <el-select
                  v-model="form.disease"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in diseaseOptions"
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
              <el-form-item label="药品数量" prop="amount">
                <el-input-number v-model="form.amount" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="药品单位" prop="unit" >
                <el-input v-model="form.unit" :style="{width: '100%'}" placeholder="请输入单位" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="药品单价" prop="unitPrice">
                <el-input-number v-model="form.unitPrice" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="药品总价" prop="totalPrice">
                <el-input-number v-model="form.totalPrice" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="用药开始日期" prop="beginDate">
                <el-date-picker type="date" v-model="form.beginDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用药结束日期" prop="endDate">
                <el-date-picker type="date" v-model="form.endDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="看病日期" prop="treatDate">
                <el-date-picker type="date" v-model="form.treatDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用方式" prop="useWay">
                <el-select
                  v-model="form.useWay"
                  filterable
                  allow-create
                  default-first-option
                  :style="{width: '100%'}">
                  <el-option
                    v-for="dict in useWayOptions"
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
              <el-form-item label="用药频率" prop="perDay">
                每
                <el-input-number v-model="form.perDay" controls-position="right" :style="{width: '80px'}" :min="0" :controls="true" :precision="0"/>
                天
                <el-input-number v-model="form.perTimes" controls-position="right" :style="{width: '80px'}" :min="0" :controls="true" :precision="0"/>
                次
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用药药量" prop="ec">
                每次
                <el-input-number v-model="form.ec" controls-position="right" :style="{width: '90px'}" :min="0" :controls="true" :precision="0"/>
                <el-select
                  v-model="form.eu"
                  filterable
                  allow-create
                  default-first-option
                  :style="{width: '90px'}">
                  <el-option
                    v-for="dict in euOptions"
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
              <el-form-item label="是否有效" prop="available">
                <el-switch v-model="form.available"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否提醒" prop="remind">
                <el-switch v-model="form.remind"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>

    <!-- 新增用药页面 -->
    <el-dialog :title="drugDetailTitle" width="450px" :visible.sync="drugDetailVisible"  append-to-body>
      <treat-drug-detail-detail
        :treatForDrugDetailData="treatForDrugDetailData"
        @closeMe="closeTreatDrugDetailDetail"
        @refreshList="refreshDrug"
      />
    </el-dialog>

    <!-- 用药列表页面 -->
    <el-dialog :title="drugDetailListTitle" width="750px" :visible.sync="drugDetailListVisible"  append-to-body>
      <treat-drug-detail-list
        :treatForDrugDetailListData="treatForDrugDetailListData"
      />
    </el-dialog>

    <!-- 用药日历统计页面 -->
    <el-dialog :title="drugDetailCalendarStatTitle" width="800px" :visible.sync="drugDetailCalendarStatVisible"  append-to-body>
      <treat-drug-detail-calendar-stat
        :treatDrugData="treatDrugData"
      />
    </el-dialog>

    <!-- 用药时间点统计页面 -->
    <el-dialog :title="drugDetailTimeStatTitle" width="800px" :visible.sync="drugDetailTimeStatVisible"  append-to-body>
      <treat-drug-detail-time-stat
        :treatDrugData="treatDrugData"
      />
    </el-dialog>

    <!-- 用药统计页面 -->
    <el-dialog :title="drugDetailStatTitle" width="900px" :visible.sync="drugDetailStatVisible" append-to-body customClass="customDialogCss">
      <treat-drug-detail-stat/>
    </el-dialog>

    <!-- 用药日历 -->
    <el-dialog :title="calendarTitle" width="600px" :visible.sync="calendarVisible" append-to-body customClass="customDialogCss">
      <treat-drug-calendar/>
    </el-dialog>

  </div>
</template>

<script>
  import {getTreatRecordTagsTree,getTreatCategoryTree} from "@/api/health/treat/treatRecord";
  import {fetchList,deleteTreatDrug,getTreatDrugCategoryTree,getLastTreatDrug,getTreatDrug,createTreatDrug,updateTreatDrug} from "@/api/health/treat/treatDrug";
  import TreatDrugDetailDetail from '../treatDrugDetail/detail'
  import TreatDrugDetailList from '../treatDrugDetail/index'
  import TreatDrugDetailCalendarStat from '../treatDrugDetail/calendarStat'
  import TreatDrugDetailTimeStat from '../treatDrugDetail/timeStat'
  import TreatDrugDetailStat from '../treatDrugDetail/stat'
  import TreatDrugCalendar from './calendar'
  import {getDay,getDayByDate,getNowDateString} from "@/utils/datetime";
  import {copyObject} from "@/utils/index";


export default {
  name: "TreatDrug",
  components: {
    'treat-drug-detail-detail':TreatDrugDetailDetail,
    'treat-drug-detail-list':TreatDrugDetailList,
    'treat-drug-detail-calendar-stat':TreatDrugDetailCalendarStat,
    'treat-drug-detail-time-stat':TreatDrugDetailTimeStat,
    'treat-drug-detail-stat':TreatDrugDetailStat,
    'treat-drug-calendar':TreatDrugCalendar
  },
  props: {
    //父层带过来的账户信息值
    treatRecordData:{
      id:undefined
    }
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //表单页面修改
      title:'',
      open:false,
      //新增的按钮状态
      createDisable:true,
      //用药日历
      calendarTitle:undefined,
      calendarVisible:false,
      //用药明细start
      drugDetailTitle:'',
      drugDetailVisible:false,
      treatForDrugDetailData:{},
      //用药明细end
      //用药详情列表页面 start
      drugDetailListTitle:'',
      //给药品信息使用的外键
      treatForDrugDetailListData:{
        treatDrugId:undefined
      },
      drugDetailListVisible:false,
      //用药详情列表页面 end

      //给药品信息使用的外键
      treatDrugData:{
        treatDrugId:undefined
      },
      //用药详情日历统计页面 start
      drugDetailCalendarStatTitle:'',
      drugDetailCalendarStatVisible:false,
      //用药详情日历统计页面 end
      //用药详情时间点统计页面 start
      drugDetailTimeStatTitle:'',
      drugDetailTimeStatVisible:false,
      //用药详情时间点统计页面 end

      //用药详情统计页面 start
      drugDetailStatTitle:'',
      drugDetailStatVisible:false,
      //用药详情统计页面 end
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
      treatDrugList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      booleanOptions:this.booleanOptions,
      //疾病标签
      tagsOptions:[],
      //看病类型
      diseaseOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 表单参数 start
      //药品名
      nameOptions:[],
      //疾病
      diseaseOptions:[],
      //使用方式
      useWayOptions:[],
      //用药单位
      euOptions:[],
      loading:false,
      // 表单参数
      form: {
        id:undefined,
        budgetId:undefined
      },
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "药品名称不能为空", trigger: "blur" }
        ],
        disease: [
          { required: true, message: "针对疾病不能为空", trigger: "blur" }
        ],
        beginDate: [
          { required: true, message: "用药开始日期不能为空", trigger: "blur" }
        ],
        endDate: [
          { required: true, message: "用药结束日期不能为空", trigger: "blur" }
        ],
        treatDate: [
          { required: true, message: "看病时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatRecordData);
    this.getTreatRecordTagsTreeselect();
    this.getDiseaseTreeselect();
  },
  //监听父层带过来的账户信息值
  watch:{
    treatRecordData(newVal,oldVal){
      this.treatRecordData = newVal;
      this.handleReceiveData(this.treatRecordData);
    }
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data!=null){
        this.queryParams.treatRecordId=this.treatRecordData.id;
        this.createDisable= false;
      }
      this.getList();
    },
    /** 添加用药明细后刷新 */
    refreshDrug(){
      //目前什么也不做
    },
    /** 初始化下拉树结构 */
    initOptionList(){
      getTreatDrugCategoryTree('name',false).then(response => {
        this.nameOptions = response;
      });
      getTreatDrugCategoryTree('disease',false).then(response => {
        this.diseaseOptions = response;
      });
      this.getDictItemTree('DRUG_USE_WAY',false).then(response => {
        this.useWayOptions = response;
      });
      this.getDictItemTree('DRUG_EU',false).then(response => {
        this.euOptions = response;
      });

    },
    /** 查询疾病标签下拉树结构 */
    getTreatRecordTagsTreeselect() {
      getTreatRecordTagsTree(false).then(response => {
        this.tagsOptions = response;
      });
    },
    getDiseaseTreeselect() {
      getTreatCategoryTree('disease',false).then(response => {
        this.diseaseOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.treatDrugList = response.rows;
          const n = this.treatDrugList.length;
          const nowTime = new Date(Date.parse(getNowDateString().replace(/-/g,"/")));
          for(let i=0;i<n;i++){
            let row = this.treatDrugList[i];
            //先计算出days供下面的方法使用
            if(!this.isObjectEmpty(row.beginDate)&&!this.isObjectEmpty(row.endDate)){
              const bd = new Date(Date.parse(row.beginDate.replace(/-/g,"/")));
              const ed = new Date(Date.parse(row.endDate.replace(/-/g,"/")));
              const s1 = parseInt(bd - nowTime);
              const s2 = parseInt(ed - nowTime);
              if(s1<0&&s2>=0){
                row.active = true;
              }else{
                row.active = false;
              }
            }
          }
          this.total = response.total;
          this.loading = false;
        }
      );
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
    /** 用药统计操作 */
    handleDetailStat(){
      this.drugDetailStatTitle="用药统计",
      this.drugDetailStatVisible = true;
    },
    /** 用药日历操作 */
    handleCalendar(){
      this.calendarTitle="用药日历",
      this.calendarVisible = true;
    },
    /** 增加用药详情编辑操作 */
    handleAddDrugDetail(row){
      this.drugDetailVisible = true;
      this.drugDetailTitle = "添加用药("+row.name+")";
      this.treatForDrugDetailData = Object.assign({}, this.treatForDrugDetailData, {
        treatDrugId: row.id
      });
    },
    /** 用药详情列表操作 */
    handleDetailList(row){
      this.drugDetailListVisible = true;
      this.drugDetailListTitle = "("+row.name+")"+"用药列表";
      this.treatForDrugDetailListData = Object.assign({}, this.treatForDrugDetailListData, {
        treatDrugId: row.id
      });
    },
    /** 用药详情日历统计操作 */
    handleDetailCalendarStat(row){
      this.drugDetailCalendarStatVisible = true;
      this.drugDetailCalendarStatTitle = "("+row.name+")"+"用药统计分析";
      this.treatDrugData = Object.assign({}, this.treatDrugData, {
        treatDrugId: row.id
      });
    },
    /** 用药详情时间点统计操作 */
    handleDetailTimeStat(row){
      this.drugDetailTimeStatVisible = true;
      this.drugDetailTimeStatTitle = "("+row.name+")"+"用药时间点分析";
      this.treatDrugData = Object.assign({}, this.treatDrugData, {
        treatDrugId: row.id
      });
    },
    closeTreatDrugDetailDetail(){
      this.drugDetailVisible = false;
    },
    /** 关闭表单编辑操作 */
    closeTreatDrugDetail(){
      this.drugVisible = false;
    },
    //从已经有的用药记录加载
    loadProperties(newVal){
      if(!this.isObjectEmpty(this.form.id)){
        //修改类不需要
        return;
      }
      //加载复制详情
      getLastTreatDrug(newVal).then(response => {
        this.form.unit = response.unit;
        this.form.unitPrice = response.unitPrice;
        this.form.perDay = response.perDay;
        this.form.perTimes = response.perTimes;
        this.form.available = response.available;
        this.form.remind = response.remind;
        this.form.totalPrice = response.totalPrice;
        this.form.eu = response.eu;
        this.form.ec = response.ec;
        this.form.useWay = response.useWay;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name:undefined,
        disease:undefined,
        unit: '盒',
        amount: 1,
        unitPrice:0,
        shipment:0,
        perDay:1,
        treatDate:getDay(0),
        beginDate:getDay(0),
        endDate:getDay(14),
        perTimes:1,
        available:true,
        remind:true,
        totalPrice:0,
        eu:'粒',
        ec:1,
        useWay:'餐前'
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      this.open=false;
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTreatDrug(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open=false;
              this.getList();
            });
          } else {
            createTreatDrug(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open=false;
              this.getList();
            });
          }
        }
      });
    },
    /** 启用操作 */
    handleReOpen(row) {
      let formData = row;
      let that = this;
      this.$confirm('是否要重新启用[' + formData.name + ']药品?默认药品结束使用时间为今天的后两个星期', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
      }).then(function() {
        formData.treatRecordId = formData.treatRecord.id;
        //设置用药结束时间为当期时间+两个星期
        const newDate = getDayByDate(14,getNowDateString());
        formData.endDate = newDate;
        updateTreatDrug(formData).then(response => {
          that.getList();
          that.msgSuccess("启用成功");
        });
      })
    },
    /** 停药操作 */
    handleStop(row) {
      let formData = row;
      let that = this;
      this.$confirm('是否要停止服用[' + formData.name + ']药品?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
      }).then(function() {
        formData.treatRecordId = formData.treatRecord.id;
        //设置用药结束时间为昨天
        const newDate = getDayByDate(-1,getNowDateString());
        formData.endDate = newDate;
        updateTreatDrug(formData).then(response => {
          that.getList();
          that.msgSuccess("停药成功");
        });
      })
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "添加";
      this.form.treatRecordId = this.queryParams.treatRecordId;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "修改";
      const id = row.id || this.ids.join(",")
      //加载详情
      getTreatDrug(id).then(response => {
        //copyObject(response,this.form);
        this.form = response;
        this.form.treatRecordId = response.treatRecord.id;
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
          return deleteTreatDrug(ids);
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
          return exportDrug(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

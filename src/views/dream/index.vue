<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="梦想名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="梦想状态" prop="inStatuses">
        <el-select
          v-model="queryParams.inStatuses"
          placeholder="梦想状态"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusSearchOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="梦想进度">
          <el-input-number v-model="queryParams.minRate" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxRate" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="起止日期">
        <el-select
          v-model="queryParams.dateQueryType"
          placeholder="日期类型"
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateQueryTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
      <el-form-item  v-if="moreCdn==true"  label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="排序方式"
          collapse-tags
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          collapse-tags
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['dream:query']">搜索</el-button>
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
          @click="handleCreate"
          v-hasPermi="['dream:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['dream:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dream:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['dream:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshRate"
          v-hasPermi="['dream:refreshRate']"
        >刷新进度</el-button>
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
    <el-table v-loading="loading" :data="dreamList" @selection-change="handleSelectionChange"  :row-class-name="tableRowClassName">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="280px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
          <span v-if="row.userPlan != null">
           <el-tag type="success">计划</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <span :style="{'color':getStatusColor(row)}">{{ row.statusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成进度" align="center" width="80">
        <template slot-scope="{row}">
          <span v-if="row.rate!=null">
            <el-progress :percentage="row.rate" :color="customColors"></el-progress>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.remind" disabled ></el-switch>
          <span class="link-type" @click="showRemindSetting(row)"><i class="el-icon-setting" /></span>
        </template>
      </el-table-column>
      <el-table-column label="期望实现日期" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.proposedDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="剩余时间" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="(row.leftDays)<0">
           <el-tag type="danger" size="mini">超期</el-tag>
          </span>
          <span>{{ formatLeftDays(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="紧急分" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.emergencyScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="困难等级" align="center" width="140">
        <template slot-scope="{row}">
          <el-rate v-model="row.difficulty" disabled></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="重要等级" align="center" width="140">
        <template slot-scope="{row}">
          <el-rate v-model="row.importantLevel" disabled></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="预计花费天数" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.expectDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最晚截止日期" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.deadline }}</span>
        </template>
      </el-table-column>
      <el-table-column label="延期次数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.delays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.finishedDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联计划" align="center"  min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ isObjectEmpty(row.userPlan) ? '--':row.userPlan.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划期望值" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.planValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最小资金" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.minMoney) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最大资金" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.maxMoney) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['dream:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['dream:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="梦想名称" prop="name">
             <el-input v-model="form.name" placeholder="请输入梦想名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="困难程度" prop="difficulty">
             <el-rate
               v-model="form.difficulty"
               show-score
               text-color="#ff9900"
               score-template="{value}">
             </el-rate>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度" prop="importantLevel">
             <el-rate
               v-model="form.importantLevel"
               show-score
               allow-half
               text-color="#ff9900"
               score-template="{value}">
             </el-rate>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="期望实现日期" prop="proposedDate">
              <el-date-picker type="date" v-model="form.proposedDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '200px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最晚截止日期" prop="deadline">
              <el-date-picker type="date" v-model="form.deadline" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '200px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实现日期" prop="finishedDate">
              <el-date-picker type="date" v-model="form.finishedDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '200px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="状态"
                clearable
                collapse-tags
                size="small"
                style="width: 200px"
              >
                <el-option
                  v-for="dict in statusOptions"
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
            <el-form-item label="最小资金" prop="minMoney">
             <el-input-number v-model="form.minMoney" :style="{width: '200px'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大资金" prop="maxMoney">
             <el-input-number v-model="form.maxMoney" :style="{width: '200px'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预计完成天数" prop="expectDays">
             <el-input-number v-model="form.expectDays" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进度(%)" prop="rate">
             <el-input-number v-model="form.rate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :max="100" :controls="false" :precision="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="关联计划" prop="userPlanId">
              <treeselect
                v-model="form.userPlanId"
                :options="userPlanOptions"
                :disable-branch-nodes="true"
                :show-count="true"
                :searchable="true"
                placeholder="请选择计划"
                style="width: 200px"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划期望值" prop="planValue">
              <el-input-number v-model="form.planValue" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
              <span class="link-type" @click="showPlanValueHelp"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消息提醒" prop="remind">
              <el-switch v-model="form.remind"></el-switch>
              <span v-if="form.id!=null&&form.remind==true">
                <el-button type="primary" size="small" @click="showRemindSetting(form)" icon="el-icon-setting" v-hasPermi="['dream:remind:edit']">设置</el-button>
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分奖励" prop="rewardPoint">
              <el-input-number v-model="form.rewardPoint" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="期望时间修改历史" prop="dateChangeHistory">
              <el-input v-model="form.dateChangeHistory" disabled type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 提醒配置页面 -->
    <el-dialog :title="remindTitle" width="580px" :visible.sync="remindVisible" append-to-body>
      <remind-detail
        :dreamData="dreamData"
        @closeMe="closeRemind"
      />
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getDream,createDream,updateDream,deleteDream,refreshDreamRate} from "@/api/dream/dream";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import {deepClone} from "@/utils/index";
  import {formatDays} from "@/utils/datetime";
  import RemindDetail from './remind'
  import {dispatchCommonStat} from "@/utils/planUtils";
  import {progressColors2} from "@/utils/mulanbay";

export default {
  name: "Dream",
  components: {
    Treeselect,
    'remind-detail':RemindDetail
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      //状态
      statusOptions:[],
      statusSearchOptions:[],
      //时间类型
      dateQueryTypeOptions:[],
      //排序字段
      sortFieldOptions:[],
      //排序方式
      sortTypeOptions:[],
      //关联计划
      userPlanOptions:[],
      // 总条数
      total: 0,
      // 列表数据
      dreamList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        dateQueryType: 'proposedDate',
        sortField:'createdTime',
        sortType:'desc'
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //进度百分比颜色
      customColors: progressColors2,
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
        proposedDate: [
          { required: true, message: "期望实现日期不能为空", trigger: "blur" }
        ],
        difficulty: [
          { required: true, message: "困难程度不能为空", trigger: "blur" }
        ],
        importantLevel: [
          { required: true, message: "重要程度不能为空", trigger: "blur" }
        ]
      },
      //提醒配置
      remindTitle:'',
      remindVisible:false,
      dreamData:{
        id:undefined
      },

    };
  },
  created() {
    //梦想状态(搜索的是序列值)
    this.getEnumTree('DreamStatus','ORDINAL',false).then(response => {
      this.statusSearchOptions = response;
    });
    //梦想状态
    this.getEnumTree('DreamStatus','FIELD',false).then(response => {
      this.statusOptions = response;
    });
    //日期类型
    this.getDictItemTree('DREAM_DATE_QUERT_TYPE',false).then(response => {
      this.dateQueryTypeOptions = response;
    });
    //排序字段
    this.getDictItemTree('DREAM_ORDER_BY_TYPE',false).then(response => {
      this.sortFieldOptions = response;
    });
    //排序方式
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.sortTypeOptions = response;
    });
    this.getList();
    //用户计划
    this.getUserPlanTreeselect();
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
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('Dream',this.$router);
    },
    formatLeftDays(row){
      if(row.status == 'FINISHED'){
        return '--';
      }else{
        var ss='';
        var d = row.leftDays;
        if(d<0){
          ss='已过去';
          d = 0-d;
        }
        ss+=formatDays(d);
        return ss;
      }
    },
    /** 状态的字段颜色 */
    getStatusColor(row) {
      if(row.status=='CREATED'){
        return 'black';
      }else if(row.status=='STARTED'){
        return '#4169E1';
      }else if(row.status=='FINISHED'){
        return 'green';
      }else if(row.status=='PAUSED'){
        return '#C71585';
      }else if(row.status=='GIVEDUP'){
        return '#A9A9A9';
      }else{
        return 'black';
      }
    },
    //行颜色
    tableRowClassName({row, rowIndex}) {
      if(row.status!=null){
        //目前不使用行背景颜色
        return 'created-row';
      }
      if(row.status=='CREATED'){
        return 'created-row';
      }else if(row.status=='STARTED'){
        return 'started-row';
      }else if(row.status=='FINISHED'){
        return 'finished-row';
      }else if(row.status=='PAUSED'){
        return 'paused-row';
      }else if(row.status=='GIVEDUP'){
        return 'gaveup-row';
      }else{
        return '';
      }
    },
    /** 用户计划列表 */
    getUserPlanTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
    },
    //刷新进度
    handleRefreshRate(){
      refreshDreamRate().then(response => {
        this.msgSuccess(response);
      });
    },
    //用户计划值帮助
    showPlanValueHelp(){
      var msg='(1)表达的是为了实现这个梦想需要达到的预期值<br/>'+
      '(2)比如学习尤克里里至少要学1000个小时，那么在这里就填1000，系统到时自动会和计划配置里的统计比对<br/>'+
      '(3)单位类型目前不需要配置';
      this.msgAlert('提示',msg);
    },
    //打开设置提醒
    showRemindSetting(row){
      if(this.isObjectEmpty(row.id)){
        this.msgError('请先保存表单信息');
        return;
      }
      this.remindTitle='['+row.name+']提醒配置';
      this.remindVisible=true;
      this.dreamData = Object.assign({}, this.dreamData, {
        id: row.id
      });
    },
    /** 关闭提醒页面 */
    closeRemind(){
      this.remindVisible=false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      //转换多选框的中挂号问题
      var acQueryParams = deepClone(this.addDateRange(this.queryParams, this.dateRange));
      if(acQueryParams.inStatuses!=null){
        acQueryParams.inStatuses = acQueryParams.inStatuses.join(',');
      }
      fetchList(acQueryParams).then(
        response => {
          this.dreamList = response.rows;
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
        status: "CREATED",
        difficulty: 5,
        importantLevel: 3,
        rate: 0,
        expectDays:0,
        rewardPoint:0,
        remind:false,
        userPlanId:undefined,
        remark:undefined
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
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getDream(id).then(response => {
        this.form = response;
        if(this.form.userPlan!=null){
          this.form.userPlanId = ''+this.form.userPlan.id;
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDream(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.getList();
              this.open = false;
            });
          } else {
            createDream(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.getList();
              this.open = false;
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
          return deleteDream(ids);
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
          return exportDream(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

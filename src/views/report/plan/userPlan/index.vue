<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划类型" prop="planType">
        <el-select
          v-model="queryParams.planType"
          style="width: 120px"
          clearable
          placeholder="请选择">
          <el-option
            v-for="dict in planTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据类型" prop="filterType">
        <el-select
          v-model="queryParams.filterType"
          placeholder="状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in filterTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计最新进度" prop="statNow">
        <el-switch v-model="queryParams.statNow"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:plan:userPlan:query']">搜索</el-button>
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
          v-hasPermi="['report:plan:userPlan:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:plan:userPlan:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:plan:userPlan:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:plan:userPlan:export']"
        >导出</el-button>
      </el-col>
    </el-row>
    <!--列表数据-->
    <el-table v-loading="loading" :data="userPlanList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ formatTitle(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置项" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleConfigValue(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="计划类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planConfig.planTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="queryParams.statNow==true" label="最新次数统计值" :show-overflow-tooltip="true" width="150">
        <template slot-scope="{row}">
          <span v-if="row.cf=='T'">
           <span style="color:green">{{ row.cv }}&nbsp;<i class="el-icon-check" /></span>
          </span>
          <span v-else-if="row.cf=='F'">
           <span style="color:red">{{ row.cv }}</span>
          </span>
          <span v-else>
           <span>{{ row.cv }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="queryParams.statNow==true" label="最新值统计值" :show-overflow-tooltip="true" width="150">
        <template slot-scope="{row}">
          <span v-if="row.vf=='T'">
           <span style="color:green">{{ row.vv }}&nbsp;<i class="el-icon-check" /></span>
          </span>
          <span v-else-if="row.vf=='F'">
           <span style="color:red">{{ row.vv }}</span>
          </span>
          <span v-else>
           <span>{{ row.vv }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="比较类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planConfig.compareTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="queryParams.statNow==true" label="次数参考值" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.cr }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="queryParams.statNow==true" label="值参考值" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.vr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleStat(row)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" disabled active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="日历时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.calendarTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center">
        <template slot-scope="{row}">
          <el-switch v-model="row.remind" disabled ></el-switch>
          <span class="link-type" @click="showRemindSetting(row)"><i class="el-icon-setting" /></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right"  width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['report:plan:userPlan:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:plan:userPlan:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="740px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="选取模板" prop="planConfigId">
             <treeselect
              v-model="form.planConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="planConfigOptions"
              :disable-branch-nodes="true"
              :show-count="true"
              :searchable="true"
              :disabled="ncoDisabled"
              placeholder="请选择模板"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <form-create v-model="fApi" :option="fcOption"  :rule="fcRule"></form-create>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="计划标题" prop="title">
              <el-input v-model="form.title" style="width: 580px"  placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="日历标题" prop="calendarTitle">
              <el-input v-model="form.calendarTitle" style="width: 580px"  placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="日历时间" prop="calendarTime">
              <el-time-picker
                 v-model="form.calendarTime"
                 :picker-options="{
                       selectableRange: '00:00:00 - 23:59:00'
                 }"
                 format="HH:mm" value-format="HH:mm"
                 placeholder="任意时间点">
               </el-time-picker>
               <span class="link-type" @click="msgAlert('提示','如果设置了，则在日历视图中显示具体的时间点，值范例为:08:30。如果为空，则为全天日历。')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划值单位" prop="unit">
              <el-input v-model="form.unit" style="width: 230px"  placeholder="请输入单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="计划状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
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
            <el-form-item label="首次统计日期" prop="firstStatDay">
              <el-date-picker type="date" v-model="form.firstStatDay" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '230px'}" placeholder="请选择日期" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="remark">
              <el-input v-model="form.remark"  style="width: 580px"  type="textarea" placeholder="请输入内容"></el-input>
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
        :userPlanData="userPlanData"
        @closeMe="closeRemind"
      />
    </el-dialog>

    <!-- 计划值配置项页面 -->
    <el-dialog :title="configValueTitle" width="800px" :visible.sync="configValueVisible"  append-to-body>
      <config-value :userPlanData="userPlanData"/>
    </el-dialog>

    <!-- 统计页面 -->
    <el-dialog :title="statTitle" width="850px" :visible.sync="statVisible"  append-to-body  customClass="customDialogCss">
      <plan-stat :userPlanData="userPlanData"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getUserPlan,createUserPlan,updateUserPlan,deleteUserPlan} from "@/api/report/plan/userPlan";
  import {getPlanConfigTree,getPlanConfig} from "@/api/report/plan/planConfig";
  import {getStatValueConfigs} from "@/api/report/statValueConfig";
  import {generateFcRules,getBindValues,setBindValues} from "@/utils/formCreateUtils";
  import {getValueCompareResult,getCompareYearString} from "@/utils/planUtils";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import formCreate, { maker } from '@form-create/element-ui'
  import RemindDetail from './remind'
  import PlanStat from './stat'
  import ConfigValue from './configValue'

export default {
  name: "UserPlan",
  components: {
    Treeselect,
    formCreate:formCreate.$form(),
    'remind-detail':RemindDetail,
    'plan-stat':PlanStat,
    'config-value':ConfigValue
  },
  data() {
    return {
      //统计
      statTitle:'',
      statVisible:false,
      //提醒配置
      remindTitle:'',
      remindVisible:false,
      //计划值配置
      configValueTitle:'',
      configValueVisible:false,
      userPlanData:{
        id:undefined
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
      // 总条数
      userPlanList:[],
      planConfigOptions:[],
      planTypeOptions:[],
      filterTypeOptions:[],
      ncoDisabled:false,
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
        status: undefined,
        statNow:false,
        filterType:'ORIGINAL'
      },
      // 表单参数
      form: {},
      // formCreate属性start
      fcRule:[],
      fcOption:{
        submitBtn:false,
        form:{
          labelWidth:'100px',
          size:undefined,
          inline:true,
          hideRequiredAsterisk:false
        }
      },
      //表单对象
      fApi:{},
      // formCreate属性end
      rules: {
        planConfigId: [
          { required: true, message: "模板不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        calendarTitle: [
          { required: true, message: "日历标题不能为空", trigger: "blur" }
        ],
        unit: [
          { required: true, message: "计划值单位不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        remind: [
          { required: true, message: "消息提醒不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getPlanConfigOptionsTreeselect();
    //this.fApi.rule=[];
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.getEnumTree('PlanReportDataStatFilterType','FIELD',false).then(response => {
      this.filterTypeOptions = response;
    });

  },
  methods: {
    /** 格式化标题，计算各数值 */
    formatTitle(row){
      if(!this.isObjectEmpty(row.planReport)){
        //完成值与进度
        let countResult = getValueCompareResult(row.planReport.reportCountValue,row.planReport.planCountValue,row.planConfig.compareType,'次');
        row.cf = countResult.finished;
        row.cv = countResult.valueStr;
        let valueResult = getValueCompareResult(row.planReport.reportValue,row.planReport.planValue,row.planConfig.compareType,row.unit);
        row.vf = valueResult.finished;
        row.vv = valueResult.valueStr;
        //参考值
        row.cr = row.planReport.planCountValue+getCompareYearString(row.planReport.userPlanYear)+'次';
        row.vr = row.planReport.planValue+getCompareYearString(row.planReport.userPlanYear)+row.unit;
      }
      return row.title;
    },
    /** 统计 */
    handleStat(row){
      this.statTitle='用户计划统计';
      this.statVisible=true;
      this.userPlanData = Object.assign({}, this.userPlanData, {
        id: row.id
      });
    },
    /** 计划值配置 */
    handleConfigValue(row){
      this.configValueTitle='['+row.title+']计划值配置';
      this.configValueVisible=true;
      this.userPlanData = Object.assign({}, this.userPlanData, {
        id: row.id
      });
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getPlanConfigOptionsTreeselect() {
      getPlanConfigTree(false).then(response => {
        this.planConfigOptions = response;
      });
    },
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      //加载下来菜单配置项
      this.loadStatValueConfigs(newVal,'PLAN',null);
      //从模板拷贝基础信息
      getPlanConfig(newVal).then(response => {
        this.form.calendarTitle= response.defaultCalendarTitle;
        this.form.title= response.title;
        this.form.unit = response.unit;
      });
    },
    /** 获取值配置列表列表 */
    loadStatValueConfigs(fid,type,bindValues){
      getStatValueConfigs(fid,type).then(
        response => {
          const newRule = generateFcRules(response);
          //需要重载规则，否则编辑时无法设定值
          this.fApi.reload(newRule);
          setBindValues(bindValues,this.fApi);
        }
      );
    },
    //打开设置提醒
    showRemindSetting(row){
      if(this.isObjectEmpty(row.id)){
        this.msgError('请先保存用户表单信息');
        return;
      }
      this.remindTitle='['+row.title+']提醒配置';
      this.remindVisible=true;
      this.userPlanData = Object.assign({}, this.userPlanData, {
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
      fetchList(this.queryParams).then(
        response => {
          this.userPlanList = response.rows;
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
        status:'ENABLE',
        remind:false,
        orderIndex :1,
        showInIndex:true,
        title:undefined,
        calendarTitle:undefined
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
      this.ncoDisabled=false;
      this.fcRule=[];
      //this.fApi.reload([]);
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.ncoDisabled=true;
      const id = row.id || this.ids.join(",")
      getUserPlan(id).then(response => {
        this.form = response;
        this.form.planConfigId= response.planConfig.id;
        this.valueUnit = response.planConfig.unit;
        //加载下来菜单配置项
        this.loadStatValueConfigs(this.form.planConfigId,'PLAN',this.form.bindValues);
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          //获取绑定值
          const bindValues = getBindValues(this.fApi);
          this.form.bindValues = bindValues;
          if (this.form.id != undefined) {
            updateUserPlan(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createUserPlan(this.form).then(response => {
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
          return deleteUserPlan(ids);
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
          return exportUserPlan(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

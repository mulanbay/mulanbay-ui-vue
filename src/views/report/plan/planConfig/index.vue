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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planConfig:query']">搜索</el-button>
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
          v-hasPermi="['report:plan:planConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:plan:planConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:plan:planConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:plan:planConfig:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="planConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="300" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置项" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleStatValueList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="计划类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="比较类型" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.compareTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值单位" align="center">
        <template slot-scope="{row}">
          <span>{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="查询类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sqlTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分奖励" align="center">
        <template slot-scope="{row}">
          <span>{{ row.rewardPoint }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
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
            v-hasPermi="['report:plan:planConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:plan:planConfig:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body customClass="customDialogCss">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="选取模板" prop="tmpPlanConfigId">
             <treeselect
              v-model="form.tmpPlanConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="planConfigOptions"
              :disable-branch-nodes="true"
              :show-count="true"
              :searchable="true"
              :disabled="ncoDisabled"
              placeholder="请选择模板" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="查询类型" prop="sqlType">
              <el-select v-model="form.sqlType" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in sqlTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划类型" prop="planType">
              <el-select v-model="form.planType" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in planTypeOptions"
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
            <el-form-item label="查询语句" prop="sqlContent">
              <el-input v-model="form.sqlContent" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
              <span class="link-type" @click="showSqlHelp()"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="时间字段" prop="dateField">
              <el-input v-model="form.dateField" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户字段" prop="userField">
              <el-input v-model="form.userField" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="比较类型" prop="compareType">
              <el-radio-group v-model="form.compareType" style="width: 230px">
                <el-radio
                  v-for="dict in compareTypeOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认单位" prop="unit">
              <el-input v-model="form.unit" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="默认次数" prop="defaultPlanCountValue">
              <el-input-number v-model="form.defaultPlanCountValue" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认值" prop="defaultPlanValue">
              <el-input-number v-model="form.defaultPlanValue" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="关联业务" prop="relatedBeans">
              <el-select v-model="form.relatedBeans" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in relatedBeansOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务KEY" prop="bussKey">
              <el-select v-model="form.bussKey" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in bussKeyOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
              <span class="link-type" @click="msgAlert('提示','不同的提醒可以用同一个业务key实现同一个提醒')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板等级" prop="level">
              <el-input-number v-model="form.level" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分奖励" prop="rewardPoint">
              <el-input-number v-model="form.rewardPoint" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="日历标题" prop="defaultCalendarTitle">
              <el-input v-model="form.defaultCalendarTitle" style="width: 580px"  placeholder="" />
              <span class="link-type" @click="msgAlert('提示','显示在用户日历中的标题信息')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="链接地址" prop="url">
              <el-input v-model="form.url" style="width: 580px"  placeholder="" />
              <span class="link-type" @click="msgAlert('提示','VUE版本的路由跳转名称')"><i class="el-icon-question" /></span>
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
        <el-row v-if="form.id == null&&form.tmpPlanConfigId != null" >
          <el-col :span="24">
            <el-form-item label="附加选项" prop="copyItems">
              <el-checkbox v-model="form.copyItems" @change="changeCopyItems()">同时复制配置项</el-checkbox>
              <span class="link-type" @click="msgAlert('提示','勾选则新增时同时复制模板的配置项列表')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 统计值列表页面 -->
    <el-dialog :title="statValueConfigListTitle" width="850px" :visible.sync="statValueConfigListVisible"  append-to-body>
      <stat-value-list
        :parentData="planConfigData"
      />
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getPlanConfigTree,getPlanConfig,createPlanConfig,updatePlanConfig,deletePlanConfig} from "@/api/report/plan/planConfig";
  import {getDomainClassNamesTree} from "@/api/auth/systemFunction";
  import {getBussTypeTree} from "@/api/common";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import StatValueList from '../../statValueConfig/index'

export default {
  name: "PlanConfig",
  components: {
    Treeselect,
    'stat-value-list':StatValueList
  },
  data() {
    return {
      //统计值属性start
      statValueConfigListTitle:'',
      statValueConfigListVisible:false,
      planConfigData:{
        fid:undefined,
        type:'PLAN'
      },
      //统计值属性end
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
      planConfigList:[],
      planConfigOptions:[],
      ncoDisabled:false,
      sqlTypeOptions:[],
      relatedBeansOptions:[],
      planTypeOptions:[],
      bussKeyOptions:[],
      compareTypeOptions:[],
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
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        sqlType: [
          { required: true, message: "查询类型不能为空", trigger: "blur" }
        ],
        relatedBeans: [
          { required: true, message: "关联的业务不能为空", trigger: "blur" }
        ],
        sqlContent: [
          { required: true, message: "查询语句不能为空", trigger: "blur" }
        ],
        resultType: [
          { required: true, message: "返回类型不能为空", trigger: "blur" }
        ],
        valueType: [
          { required: true, message: "返回值类型不能为空", trigger: "blur" }
        ],
        notifyType: [
          { required: true, message: "比较类型不能为空", trigger: "blur" }
        ],
        bussKey: [
          { required: true, message: "业务KEY不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('SqlType','FIELD',false).then(response => {
      this.sqlTypeOptions = response;
    });
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.getEnumTree('ValueType','FIELD',false).then(response => {
      this.valueTypeOptions = response;
    });
    this.getEnumTree('NotifyType','FIELD',false).then(response => {
      this.notifyTypeOptions = response;
    });
    this.getEnumTree('CompareType','FIELD',false).then(response => {
      this.compareTypeOptions = response;
    });
    getBussTypeTree(false).then(response => {
      this.relatedBeansOptions = response;
    });
    this.getBussKeyTreeselect();
  },
  methods: {
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      getPlanConfig(newVal).then(response => {
        response.id=undefined;
        this.form = response;
        //不重新设置会导致树形选择框不显示
        this.form.tmpPlanConfigId=newVal;
        this.form.copyItems=true;
      });
    },
    /** 配置项选择状态修改 */
    changeCopyItems(){
      this.$forceUpdate();
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getPlanConfigOptionsTreeselect() {
      getPlanConfigTree(false).then(response => {
        this.planConfigOptions = response;
      });
    },
    /** 查询业务key下拉树结构 */
    getBussKeyTreeselect() {
      getDomainClassNamesTree().then(response => {
        this.bussKeyOptions = response;
      });
    },
    /** 配置值列表 */
    handleStatValueList(row){
      this.statValueConfigListTitle='['+row.name+']配置项列表';
      this.statValueConfigListVisible=true;
      this.planConfigData = Object.assign({}, this.planConfigData, {
        fid: row.id,
        type:'PLAN'
      });
    },
    /** 查询语句帮助 */
    showSqlHelp(){
      let msg='<font color="red">注意</font>：<br/>' +
      '(1)返回结果需要两个，如果业务需要只要一个次数，返回列中手动在添加一个0<br/>'+
      '(2)比如select count(*) as c,0 as v from ......<br/>'+
      '(3)最后返回结果需要做四舍五入';
      this.msgAlert('提示',msg);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.planConfigList = response.rows;
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
        planType: 'MONTH',
        sqlType: 'SQL',
        planValue: 0,
        compareType:'MORE',
        planType:'MONTH',
        status:'ENABLE',
        level:3,
        rewardPoint:0,
        orderIndex :1,
        url:undefined,
        tmpPlanConfigId:undefined,
        copyItems:true
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
      this.getPlanConfigOptionsTreeselect();
      this.ncoDisabled=false;
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.ncoDisabled=true;
      //this.getNotifyConfigOptionsTreeselect();
      const id = row.id || this.ids.join(",")
      getPlanConfig(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updatePlanConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createPlanConfig(this.form).then(response => {
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
          return deletePlanConfig(ids);
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
          return exportPlanConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

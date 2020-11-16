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
      <el-form-item label="类型" prop="behaviorType">
        <el-select
          v-model="queryParams.behaviorType"
          placeholder="类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in behaviorTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['behavior:userBehavior:query']">搜索</el-button>
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
          v-hasPermi="['behavior:userBehavior:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['behavior:userBehavior:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['behavior:userBehavior:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['behavior:userBehavior:export']"
        >导出</el-button>
      </el-col>
    </el-row>
    <!--列表数据-->
    <el-table v-loading="loading" :data="userBehaviorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行为类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userBehaviorConfig.behaviorTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值单位" align="center">
        <template slot-scope="{row}">
          <span>{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" disabled active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="月度分析" align="center">
        <template slot-scope="{row}">
          <el-switch v-model="row.monthStat" disabled ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="日分析" align="center">
        <template slot-scope="{row}">
          <el-switch v-model="row.dayStat" disabled ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="小时分析" align="center">
        <template slot-scope="{row}">
          <el-switch v-model="row.hourStat" disabled ></el-switch>
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
            v-hasPermi="['behavior:userBehavior:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['behavior:userBehavior:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="选取模板" prop="userBehaviorConfigId">
             <treeselect
              v-model="form.userBehaviorConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="userBehaviorConfigOptions"
              :disable-branch-nodes="true"
              :show-count="true"
              :searchable="true"
              :disabled="ncoDisabled"
              placeholder="请选择上级分类"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <form-create v-model="fApi" :option="fcOption"  :rule="fcRule"></form-create>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" style="width: 580px"  placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="月分析" prop="monthStat">
              <el-switch
                v-model="form.monthStat">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日分析" prop="dayStat">
              <el-switch
                v-model="form.dayStat">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="小时分析" prop="hourStat">
              <el-switch
                v-model="form.hourStat">
              </el-switch>
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
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" style="width: 230px" placeholder="" />
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

  </div>
</template>

<script>
  import {fetchList,getUserBehaviorConfigTree,getUserBehavior,createUserBehavior,updateUserBehavior,deleteUserBehavior} from "@/api/behavior/userBehavior";
  import {getUserBehaviorTypeTree,getUserBehaviorConfig} from "@/api/behavior/userBehaviorConfig";
  import {getStatValueConfigs} from "@/api/report/statValueConfig";
  import {generateFcRules,getBindValues,setBindValues} from "@/utils/formCreateUtils";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import formCreate, { maker } from '@form-create/element-ui'
export default {
  name: "UserBehavior",
  components: {
    Treeselect,
    formCreate:formCreate.$form()
  },
  data() {
    return {
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
      //列表数据
      userBehaviorList:[],
      userBehaviorConfigOptions:[],
      behaviorTypeOptions:[],
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
        status: undefined
      },
      // 表单参数
      form: {},
      // formCreate属性start
      fcRule:[],
      fcOption:{
        submitBtn:false,
        form:{
          labelWidth:'90px',
          size:undefined,
          inline:true,
          hideRequiredAsterisk:false
        }
      },
      //表单对象
      fApi:{},
      // formCreate属性end
      rules: {
        notifyConfigId: [
          { required: true, message: "模板不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        calendarTitle: [
          { required: true, message: "日历标题不能为空", trigger: "blur" }
        ],
        warningValue: [
          { required: true, message: "警告值不能为空", trigger: "blur" }
        ],
        alertValue: [
          { required: true, message: "报警值不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        showInIndex: [
          { required: true, message: "首页展示不能为空", trigger: "blur" }
        ],
        remind: [
          { required: true, message: "消息提醒不能为空", trigger: "blur" }
        ],
        unit: [
          { required: true, message: "单位不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    getUserBehaviorTypeTree(false).then(response => {
      this.behaviorTypeOptions = response;
    });
    this.getUserBehaviorConfigOptionsTreeselect();
    //this.fApi.rule=[];
  },
  methods: {
    /** 查询搜索条件中的模板下拉树结构 */
    getUserBehaviorConfigOptionsTreeselect() {
      getUserBehaviorConfigTree(false).then(response => {
        this.userBehaviorConfigOptions = response;
      });
    },
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      //加载下来菜单配置项
      this.loadStatValueConfigs(newVal,'BEHAVIOR',null);
      //从模板拷贝基础信息
      getUserBehaviorConfig(newVal).then(response => {
        this.form.calendarTitle= response.calendarTitle;
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
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.userBehaviorList = response.rows;
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
        monthStat: true,
        dayStat:true,
        hourStat:true,
        status:'ENABLE',
        orderIndex :1
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
      getUserBehavior(id).then(response => {
        this.form = response;
        this.form.userBehaviorConfigId= response.userBehaviorConfig.id+'';
        //加载下来菜单配置项
        this.loadStatValueConfigs(this.form.notifyConfigId,'NOTIFY',this.form.bindValues);
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
            updateUserBehavior(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createUserBehavior(this.form).then(response => {
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
          return deleteUserBehavior(ids);
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
          return exportUserBehavior(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

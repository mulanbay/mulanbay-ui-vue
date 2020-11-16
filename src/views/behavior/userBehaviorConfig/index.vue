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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['behavior:userBehaviorConfig:query']">搜索</el-button>
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
          v-hasPermi="['behavior:userBehaviorConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['behavior:userBehaviorConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['behavior:userBehaviorConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['behavior:userBehaviorConfig:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="userBehaviorConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="200" :show-overflow-tooltip="true">
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
      <el-table-column label="行为类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.behaviorTypeName }}</span>
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
      <el-table-column label="状态" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="多天数据" align="center">
        <template slot-scope="{row}">
          <el-switch  v-model="row.dateRegion" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="支持搜索" align="center">
        <template slot-scope="{row}">
          <el-switch  v-model="row.keywords" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
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
            v-hasPermi="['behavior:userBehaviorConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['behavior:userBehaviorConfig:delete']"
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
            <el-form-item label="选取模板" prop="tmpUserBehaviorConfigId">
             <treeselect
              v-model="form.tmpUserBehaviorConfigId"
              @input="loadTemplate"
              style="width: 580px"
              :options="userBehaviorConfigOptions"
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
            <el-form-item label="行为类型" prop="behaviorType">
              <el-select v-model="form.behaviorType" style="width: 230px" placeholder="请选择">
                <el-option
                  v-for="dict in behaviorTypeOptions"
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
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键字字段" prop="keywords">
              <el-input v-model="form.keywords" style="width: 580px"  placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键字查询语句" prop="keywordsSearchSql">
              <el-input v-model="form.keywordsSearchSql" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户字段" prop="userField">
              <el-input v-model="form.userField" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间字段" prop="dateField">
              <el-input v-model="form.dateField" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
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
          <el-col :span="12">
            <el-form-item label="多天数据" prop="dateRegion">
              <el-switch
                v-model="form.dateRegion">
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
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" style="width: 230px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板等级" prop="level">
              <el-input-number v-model="form.level" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
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

    <!-- 统计值列表页面 -->
    <el-dialog :title="statValueConfigListTitle" width="850px" :visible.sync="statValueConfigListVisible"  append-to-body>
      <stat-value-list
        :parentData="userBehaviorConfigData"
      />
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getUserBehaviorConfig,getUserBehaviorConfigTree,getUserBehaviorTypeTree,createUserBehaviorConfig,updateUserBehaviorConfig,deleteUserBehaviorConfig} from "@/api/behavior/userBehaviorConfig";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import StatValueList from '../../report/statValueConfig/index'

export default {
  name: "UserBehaviorConfig",
  components: {
    Treeselect,
    'stat-value-list':StatValueList
  },
  data() {
    return {
      //统计值属性start
      statValueConfigListTitle:'',
      statValueConfigListVisible:false,
      userBehaviorConfigData:{
        fid:undefined,
        type:undefined
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
      userBehaviorConfigList:[],
      behaviorTypeOptions:[],
      //下拉
      userBehaviorConfigOptions:[],
      ncoDisabled:false,
      sqlTypeOptions:[],
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
        behaviorType: [
          { required: true, message: "业务类型不能为空", trigger: "blur" }
        ],
        sqlContent: [
          { required: true, message: "查询语句不能为空", trigger: "blur" }
        ],
        dateRegion: [
          { required: true, message: "多天数据不能为空", trigger: "blur" }
        ],
        unit: [
          { required: true, message: "单位不能为空", trigger: "blur" }
        ],
        level: [
          { required: true, message: "等级不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('SqlType','FIELD',false).then(response => {
      this.sqlTypeOptions = response;
    });
    getUserBehaviorTypeTree(false).then(response => {
      this.behaviorTypeOptions = response;
    });
  },
  methods: {
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      getUserBehaviorConfig(newVal).then(response => {
        response.id=undefined;
        this.form = response;
        //不重新设置会导致树形选择框不显示
        this.form.tmpUserBehaviorConfigId=newVal;
      });
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserBehaviorConfigTreeselect() {
      getUserBehaviorConfigTree(false).then(response => {
        this.userBehaviorConfigOptions = response;
      });
    },
    /** 配置项列表 */
    handleStatValueList(row){
      this.statValueConfigListTitle='['+row.name+']配置项列表';
      this.statValueConfigListVisible=true;
      this.userBehaviorConfigData = Object.assign({}, this.userBehaviorConfigData, {
        fid: row.id,
        type:'BEHAVIOR'
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.userBehaviorConfigList = response.rows;
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
        orderIndex :1,
        dateRegion:false,
        level:3
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
      this.getUserBehaviorConfigTreeselect();
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
      getUserBehaviorConfig(id).then(response => {
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
            updateUserBehaviorConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createUserBehaviorConfig(this.form).then(response => {
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
          return deleteUserBehaviorConfig(ids);
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
          return exportUserBehaviorConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

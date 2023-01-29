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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['config:levelConfig:query']">搜索</el-button>
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
          v-hasPermi="['config:levelConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['config:levelConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['config:levelConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['config:levelConfig:export']"
        >导出</el-button>
      </el-col>
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleJudgeLevel"
        v-hasPermi="['config:levelConfig:judgeLevel']"
      >等级评定</el-button>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="levelConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="160px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低积分" align="center">
        <template slot-scope="{row}">
          <span>{{ row.points }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分连续天数" align="center" width="180">
        <template slot-scope="{row}">
          <span v-if="row.pointsDays==1">
             单次
          </span>
          <span v-else>连续{{ row.pointsDays }}天</span>
        </template>
      </el-table-column>
      <el-table-column label="最低评分" align="center">
        <template slot-scope="{row}">
          <span>{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分连续天数" align="center" width="180">
        <template slot-scope="{row}">
          <span v-if="row.scoreDays==1">
             单次
          </span>
          <span v-else>连续{{ row.scoreDays }}天</span>
        </template>
      </el-table-column>
      <el-table-column label="对应角色" align="center">
        <template slot-scope="{row}">
          <span v-if="row.roleId!=null" class="link-type" @click="showRoleInfo(row)">
           <i class="el-icon-info" />
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" @change="handleStatusChange(row)"></el-switch>
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
            v-hasPermi="['config:levelConfig:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['config:levelConfig:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="用户等级" prop="level">
          <el-input-number v-model="form.level" style="width: 340px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="最低积分" prop="points">
          <el-input-number v-model="form.points" style="width: 340px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="积分连续天数" prop="pointsDays">
          <el-input-number v-model="form.pointsDays" style="width: 340px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="最低评分" prop="score">
          <el-input-number v-model="form.score" style="width: 340px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="评分连续天数" prop="scoreDays">
          <el-input-number v-model="form.scoreDays" style="width: 340px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="对应角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="请选择">
            <el-option
              v-for="dict in roleOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in commonStatusOptions"
              :key="dict.id"
              :label="dict.id"
            >{{dict.text}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 等级评定对话框 -->
    <el-dialog :title="judgeLevelTitle" :visible.sync="judgeLevelOpen" width="600px" append-to-body>
      <judge-level/>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,getLevelConfig,createLevelConfig,updateLevelConfig,deleteLevelConfig} from "@/api/config/levelConfig";
import {getRoleTree} from "@/api/auth/role";
import JudgeLevel from './judgeLevel'

export default {
  name: "Level",
  components: {
    'judge-level':JudgeLevel
  },
  data() {
    return {
      judgeLevelTitle:'',
      judgeLevelOpen:false,
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
      levelConfigList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      roleOptions:[],
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
        level: [
          { required: true, message: "等级不能为空", trigger: "blur" }
        ],
        points: [
          { required: true, message: "最低积分数不能为空", trigger: "blur" }
        ],
        pointsDays: [
          { required: true, message: "最低积分数的至少连续天数不能为空", trigger: "blur" }
        ],
        score: [
          { required: true, message: "最低评分数不能为空", trigger: "blur" }
        ],
        scoreDays: [
          { required: true, message: "最低评分数的至少连续天数不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    showRoleInfo(row){

    },
    /** 等级评定 */
    handleJudgeLevel(){
      this.judgeLevelTitle='等级评定';
      this.judgeLevelOpen=true;
    },
    /** 查询下拉树结构 */
    getRoleTreeselect() {
      getRoleTree(false).then(response => {
        this.roleOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.levelConfigList = response.rows;
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
        status: "ENABLE"
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
      this.getRoleTreeselect();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getRoleTreeselect();
      const id = row.id || this.ids.join(",")
      getLevelConfig(id).then(response => {
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
            updateLevelConfig(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createLevelConfig(this.form).then(response => {
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
          return deleteLevelConfig(ids);
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
          return exportLevelConfig(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

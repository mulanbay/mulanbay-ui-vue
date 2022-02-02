<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择运动" prop="sportTypeId">
        <el-select
          v-model="queryParams.sportTypeId"
          placeholder="运动"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in sportTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['sport:sportMilestone:query']">搜索</el-button>
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
          v-hasPermi="['sport:sportMilestone:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sport:sportMilestone:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sport:sportMilestone:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['sport:sportMilestone:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['sport:sportMilestone:stat']"
        >统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefresh"
          v-hasPermi="['sport:sportMilestone:refresh']"
        >刷新里程碑</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sportMilestoneList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id"  fixed="left"  sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="180px"  fixed="left" >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
          <span v-if="row.sportExercise != null">
           <el-tag type="success">已实现</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sportType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="别名" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.alais }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.kilometres+row.sportType.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时长(分钟)" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.minutes }}</span>
        </template>
      </el-table-column>
      <el-table-column label="达成目标的锻炼信息" align="center"  width="300">
        <template slot-scope="{row}">
          <span>{{ row.sportExercise==null ? '--': row.sportExercise.exerciseDate+'('+row.sportExercise.kilometres+row.sportType.unit+','+row.sportExercise.minutes+'分钟)' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.fromExerciseDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实现日期" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.toExerciseDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费天数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.costDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center"  fixed="right"  width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['sport:sportMilestone:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sport:sportMilestone:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="450px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="运动" prop="sportTypeId">
          <el-select
            v-model="form.sportTypeId"
            placeholder="运动"
            clearable
            size="small"
            style="width: 330px"
            @change="handleSportTypeChange"
          >
            <el-option
              v-for="dict in sportTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="别名" prop="alais">
          <el-input v-model="form.alais" placeholder="请输入别名" />
        </el-form-item>
        <el-form-item label="锻炼值" prop="kilometres">
          <el-input-number v-model="form.kilometres" controls-position="right" :min="0" :controls="true" :precision="2"/>
          {{ sportTypeUnit }}
          <span class="link-type" @click="msgAlert('提示','达到该里程碑需要锻炼值大于等于该值。')"><i class="el-icon-question" /></span>
        </el-form-item>
        <el-form-item label="锻炼时长" prop="minutes">
          <el-input-number v-model="form.minutes" controls-position="right" :min="0" :controls="true" :precision="0"/>
          分钟
          <span class="link-type" @click="msgAlert('提示','时长如果大于等于0，那么达到该里程碑需要锻炼时长小于等于该值。')"><i class="el-icon-question" /></span>
        </el-form-item>
        <el-form-item label="顺序" prop="orderIndex">
          <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0" disabled="true"/>
          <span class="link-type" @click="msgAlert('提示','对于某一个里程碑，排序号需要连续，从1开始。')"><i class="el-icon-question" /></span>
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

    <!-- 里程碑统计 -->
    <el-dialog title="里程碑统计" width="900px" :visible.sync="statVisible">
      <milestone-stat />
    </el-dialog>


  </div>
</template>

<script>
import {fetchList,changeSportMilestoneStatus,getSportMilestone,
createSportMilestone,updateSportMilestone,deleteSportMilestone,refreshSportMilestone} from "@/api/sport/sportMilestone";
import {getSportTypeTree,getSportType} from "@/api/sport/sportType";
import MilestoneStat from './stat'
import {copyObject} from "@/utils/index";

export default {
  name: "SportMilestone",
  components: {
    'milestone-stat':MilestoneStat
  },
  data() {
    return {
      //表单中的运动类型的单位
      sportTypeUnit:'',
      //统计页面
      statVisible:false,
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
      sportMilestoneList:[],
      //运动类型
      sportTypeOptions:[],
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
        kilometres: [
          { required: true, message: "锻炼值不能为空", trigger: "blur" }
        ],
        minutes: [
          { required: true, message: "锻炼时长不能为空", trigger: "blur" }
        ],
        sportTypeId: [
          { required: true, message: "运动类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getSportTypeTreeselect();
  },
  methods: {
    /** 查询运动类型下拉树结构 */
    getSportTypeTreeselect() {
      getSportTypeTree(false).then(response => {
        this.sportTypeOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.sportMilestoneList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeSportMilestoneStatus(row.id, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === "ENABLE" ? "DISABLE" : "ENABLE";
        });
    },
    //统计
    handleStat(){
      this.statVisible=true;
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
        sportTypeId:undefined,
        alais:undefined,
        kilometres:undefined,
        minutes:undefined,
        orderIndex:undefined,
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
    /** 刷新里程碑按钮操作 */
    handleRefresh() {
      refreshSportMilestone().then(response => {
        this.msgSuccess("刷新成功");
        this.getList();
      });
    },
    /** 选择运动类型按钮操作 */
    handleSportTypeChange() {
      getSportType(this.form.sportTypeId).then(response => {
        this.sportTypeUnit = response.unit;
      });
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
      getSportMilestone(id).then(response => {
        copyObject(response,this.form);
        this.form.sportTypeId = response.sportType.id+'';
        this.sportTypeUnit = response.sportType.unit;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSportMilestone(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createSportMilestone(this.form).then(response => {
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
          return deleteSportMilestone(ids);
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
          return exportSportMilestone(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['consume:goodsLifetime:query']">搜索</el-button>
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
          v-hasPermi="['consume:goodsLifetime:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['consume:goodsLifetime:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['consume:goodsLifetime:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['consume:goodsLifetime:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="goodsLifetimeList" @selection-change="handleSelectionChange">
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
      <el-table-column label="关键字" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.keywords }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效时长" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ formatLifetimeDays(row.days) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['consume:goodsLifetime:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:goodsLifetime:delete']"
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
    <!--寿命配置表单 -->
    <el-dialog :title="formTitle" width="600px" :visible.sync="formOpen" >
      <goods-lifetime-form :goodsLifetimeData="goodsLifetimeData" @confirmLifetimeForm="confirmLifetimeForm" @closeMe="formOpen=false"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getGoodsLifetime,deleteGoodsLifetime} from "@/api/consume/goodsLifetime";
  import {appendTagToOptions} from "@/utils/tagUtils";
  import {formatDays} from "@/utils/datetime";
  import GoodsLifetimeForm from './form'

export default {
  name: "GoodsLifetime",
  components: {
    'goods-lifetime-form':GoodsLifetimeForm
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
      // 列表数据
      goodsLifetimeList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        deleteDateType: 'NOT_NULL'
      },
      //表单修改
      goodsLifetimeData:{},
      formTitle: '',
      formOpen: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 时长显示处理 */
    formatLifetimeDays(days){
      return formatDays(days);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.goodsLifetimeList = response.rows;
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
    /** 新增按钮操作 */
    handleCreate() {
      this.formTitle = '新增';
      this.formOpen = true;
      this.goodsLifetimeData = Object.assign({}, this.goodsLifetimeData, {
        id: undefined
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.formTitle = '修改';
      this.formOpen = true;
      const id = row.id || this.ids.join(",");
      this.goodsLifetimeData = Object.assign({}, this.goodsLifetimeData, {
        id: id
      });
    },
    /** 表单提交完成 */
    confirmLifetimeForm(data){
      this.formOpen = false;
      if(data.update==false){
        //新增回第一页
        this.handleQuery();
      }else{
        this.getList();
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteGoodsLifetime(ids);
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
          return exportGoodsLifetime(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

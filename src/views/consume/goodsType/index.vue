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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery"  v-hasPermi="['consume:goodType:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-hasPermi="['consume:goodsType:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table
      v-loading="loading"
      :data="goodsTypeList"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
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
      <el-table-column label="上级名称">
        <template slot-scope="{row}">
          <span>{{ row.parentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行为名称" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.behaviorName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算" align="center" width="80">
        <template slot-scope="{row}">
          <span @click="handleBudget(row)"><svg-icon icon-class="fund" /></span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" disabled active-value="ENABLE" inactive-value="DISABLE" @change="handleStatusChange(row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="加入统计" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.statable"  disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['consume:goodsType:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleCreate(scope.row)"
            v-hasPermi="['consume:goodsType:create']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:goodsType:delete']"
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

    <!-- 添加或修改购买来源对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级分类" prop="parentId">
          <treeselect v-model="form.parentId" :style="{width: '95%'}" :options="parentGoodsTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择上级分类" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" :style="{width: '95%'}" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="行为名称" prop="behaviorName">
          <el-input v-model="form.behaviorName" :style="{width: '95%'}"/>
          <span class="link-type" @click="msgAlert('提示','用户行为分析使用，默认与名称相同')"><i class="el-icon-question" /></span>
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderIndex">
          <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="类型状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in commonStatusOptions"
              :key="dict.id"
              :label="dict.id"
            >{{dict.text}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="加入统计" prop="statable">
          <el-switch
            v-model="form.statable">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,changeGoodsTypeStatus,getGoodsType,getGoodsTypeTree,createGoodsType,updateGoodsType,deleteGoodsType} from "@/api/consume/goodsType";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import IconSelect from "@/components/IconSelect";

export default {
  name: "GoodsType",
  components: {
    Treeselect,
    IconSelect
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
      // 查询列表数据
      goodsTypeList:[],
      // 上层分类数据
      parentGoodsTypeOptions: [],
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
        parentId: [
          { required: true, message: "上级分类不能为空", trigger: "blur" }
        ],
        orderIndex: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        statable: [
          { required: true, message: "加入统计不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.goodsTypeList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询预算列表 */
    handleBudget(row){
      let goodsTypeId=undefined;
      let subGoodsTypeId=undefined;
      if(row.parentId==0){
        //大类
        goodsTypeId = row.id;
      }else{
        goodsTypeId = row.parentId;
        subGoodsTypeId = row.id;
      }
      this.$router.push({ name: 'Budget', query: {
        feeType:'BUY_RECORD',
        goodsTypeId:goodsTypeId,
        subGoodsTypeId:subGoodsTypeId
      }});
    },
    /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeBuyTypeStatus(row.id, row.status);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.status = row.status === "ENABLE" ? "DISABLE" : "ENABLE";
        });
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
        orderIndex: 0,
        status: "ENABLE",
        statable:true
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
    handleCreate(row) {
      this.reset();
      this.open = true;
      this.title = "添加";
      this.getParentGoodsTypeTreeselect();
      if (row != null && row.id) {
        this.form.parentId = row.id;
      } else {
        this.form.parentId = 0;
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getParentGoodsTypeTreeselect();
      const id = row.id || this.ids.join(",")
      getGoodsType(id).then(response => {
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
            updateGoodsType(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createGoodsType(this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteGoodsType(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 查询上级分类下拉树结构 */
    getParentGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'SELF',true).then(response => {
        this.parentGoodsTypeOptions = response;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有商品类型数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRole(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

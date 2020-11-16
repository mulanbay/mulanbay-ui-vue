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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperienceConsume:query']">搜索</el-button>
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
          v-hasPermi="['life:lifeExperienceConsume:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['life:lifeExperienceConsume:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:lifeExperienceConsume:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['life:lifeExperienceConsume:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="lifeExperienceConsumeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" width="180" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费类型" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.consumeType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.cost) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联总的消费记录" width="160" align="center">
        <template slot-scope="{row}">
          <span v-if="row.buyRecordId!=null">
           <i class="el-icon-check" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="加入统计" align="center" width="95">
        <template slot-scope="{row}">
          <el-switch v-model="row.statable" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['life:lifeExperienceConsume:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:lifeExperienceConsume:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="消费记录" prop="buyRecordId">
              <el-select
                v-model="form.buyRecordId"
                placeholder="消费记录"
                clearable
                collapse-tags
                size="small"
                style="width: 315px"
                @change="loadBuyRecord"
              >
                <el-option
                  v-for="dict in buyRecordOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
              <el-select
                v-model="form.roundDays"
                placeholder="时间段"
                clearable
                collapse-tags
                size="small"
                style="width: 120px"
                @change="getBuyRecordTreeselect"
              >
                <el-option
                  v-for="dict in roundDaysOptions"
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
            <el-form-item label="消费名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消费类型" prop="consumeTypeId">
              <el-select
                v-model="form.consumeTypeId"
                placeholder="类型"
                collapse-tags
                size="small"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="dict in consumeTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消费金额" prop="cost">
             <el-input-number v-model="form.cost" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="加入统计" prop="statable">
             <el-switch v-model="form.statable" ></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import {fetchList,getBuyRecordTree,getLifeExperienceConsume,createLifeExperienceConsume,updateLifeExperienceConsume,deleteLifeExperienceConsume} from "@/api/life/lifeExperienceConsume";
import {getBuyRecord} from "@/api/consume/buyRecord";
import {getConsumeTypeTree} from "@/api/life/consumeType";

export default {
  name: "LifeExperienceConsume",
  props: {
    //父层带过来的账户信息值
    detailForConsumeListData:{
      lifeExperienceDetailId:undefined
    }
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
      lifeExperienceConsumeList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //关联消费记录
      buyRecordOptions:[],
      roundDaysOptions:[],
      consumeTypeOptions:[],
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
          { required: true, message: "消费名称不能为空", trigger: "blur" }
        ],
        consumeTypeId: [
          { required: true, message: "消费类型不能为空", trigger: "blur" }
        ],
        cost: [
          { required: true, message: "消费金额不能为空", trigger: "blur" }
        ],
        statable: [
          { required: true, message: "加入统计不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.detailForConsumeListData);
    //排序字段
    this.getDictItemTree('LEC_CONSUME_BR_DAYS',false).then(response => {
      this.roundDaysOptions = response;
    });
    this.getConsumeTypeTreeselect();
  },
  //监听父层带过来的账户信息值
  watch:{
    detailForConsumeListData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 获取消费列表 */
    getBuyRecordTreeselect(){
      const para ={
        lifeExperienceDetailId:this.queryParams.lifeExperienceDetailId,
        roundDays:this.form.roundDays
      };
      getBuyRecordTree(para).then(
        response => {
          this.buyRecordOptions = response;
        }
      );
    },
    getConsumeTypeTreeselect(){
      getConsumeTypeTree(false).then(
        response => {
          this.consumeTypeOptions = response;
        }
      );
    },
    /** 获取消费详情 */
    loadBuyRecord(newVal){
      getBuyRecord(newVal).then(response => {
        this.form.name = response.goodsName;
        this.form.cost = response.totalPrice;
      });
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.lifeExperienceDetailId=data.lifeExperienceDetailId;
      this.getList();
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.lifeExperienceConsumeList = response.rows;
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
    handleCreate() {
      if(this.isObjectEmpty(this.queryParams.lifeExperienceDetailId)){
        this.msgError('没有人生经历信息，无法新增');
        return;
      }
      this.reset();
      this.form.lifeExperienceDetailId = this.queryParams.lifeExperienceDetailId;
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getLifeExperienceConsume(id).then(response => {
        this.form = response;
        this.form.lifeExperienceDetailId = response.lifeExperienceDetail.id;
        this.form.consumeTypeId = response.consumeType.id+'';
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLifeExperienceConsume(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createLifeExperienceConsume(this.form).then(response => {
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
          return deleteLifeExperienceConsume(ids);
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
          return exportLifeExperienceConsume(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

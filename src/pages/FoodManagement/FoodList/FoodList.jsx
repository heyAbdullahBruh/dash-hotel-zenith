import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foodService } from "../../../services/api/foodService";
import { categoryService } from "../../../services/api/categoryService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import DataTable from "../../../components/ui/DataTable/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";
import {
  faPlus,
  faSearch,
  faFilter,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FoodList.module.css";
import { useDebounce } from "../../../hooks/useDebounce";

const FoodList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    availability: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // Fetch foods with pagination and filters
  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods", page, limit, filters, debouncedSearch],
    queryFn: () =>
      foodService.getAllFoods({
        page,
        limit,
        search: debouncedSearch,
        ...filters,
      }),
    keepPreviousData: true,
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAllCategories(),
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (foodId) => foodService.toggleAvailability(foodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });

  // Delete food mutation
  const deleteFoodMutation = useMutation({
    mutationFn: (foodId) => foodService.deleteFood(foodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      setShowDeleteModal(false);
    },
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleToggleAvailability = (foodId) => {
    toggleAvailabilityMutation.mutate(foodId);
  };

  const handleDelete = () => {
    if (selectedFood) {
      deleteFoodMutation.mutate(selectedFood._id);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (food) => (
        <div className={styles.foodImage}>
          <img
            src={food.images?.[0] || "/placeholder-food.jpg"}
            alt={food.name}
            loading="lazy"
          />
        </div>
      ),
      width: "80px",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (food) => (
        <div className={styles.foodName}>
          <strong>{food.name}</strong>
          <span className={styles.foodCategory}>{food.category?.name}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (food) => (
        <div className={styles.foodPrice}>
          <span className={styles.currentPrice}>${food.price.toFixed(2)}</span>
          {food.discount > 0 && (
            <>
              <span className={styles.originalPrice}>
                ${(food.price + food.discount).toFixed(2)}
              </span>
              <span className={styles.discountBadge}>
                -
                {((food.discount / (food.price + food.discount)) * 100).toFixed(
                  0
                )}
                %
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "availability",
      header: "Status",
      render: (food) => (
        <StatusBadge
          status={food.isAvailable ? "available" : "unavailable"}
          type="availability"
        />
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (food) => (
        <div className={styles.stockIndicator}>
          <div
            className={`${styles.stockBar} ${
              food.stock > 20
                ? styles.stockHigh
                : food.stock > 0
                ? styles.stockLow
                : styles.stockOut
            }`}
            style={{ width: `${Math.min((food.stock / 50) * 100, 100)}%` }}
          />
          <span>{food.stock} units</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (food) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            icon={faEye}
            onClick={() => navigate(`/foods/${food._id}`)}
            title="View Details"
          />
          <Button
            variant="outline"
            size="sm"
            icon={faEdit}
            onClick={() => navigate(`/foods/${food._id}/edit`)}
            title="Edit"
          />
          <Button
            variant={food.isAvailable ? "warning" : "success"}
            size="sm"
            icon={food.isAvailable ? faToggleOff : faToggleOn}
            onClick={() => handleToggleAvailability(food._id)}
            title={food.isAvailable ? "Make Unavailable" : "Make Available"}
            loading={toggleAvailabilityMutation.isPending}
          />
          <Button
            variant="danger"
            size="sm"
            icon={faTrash}
            onClick={() => {
              setSelectedFood(food);
              setShowDeleteModal(true);
            }}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.foodList}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Food Management</h1>
          <p className={styles.subtitle}>
            Manage your menu items, prices, and availability
          </p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            icon={faDownload}
            onClick={() => {
              /* Export functionality */
            }}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => navigate("/foods/create")}
          >
            Add New Food
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search foods by name..."
              icon={faSearch}
              value={search}
              onChange={handleSearch}
              fullWidth
            />
          </div>
          <div className={styles.filters}>
            <Select
              options={[
                { value: "", label: "All Categories" },
                ...(categories?.map((cat) => ({
                  value: cat._id,
                  label: cat.name,
                })) || []),
              ]}
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              placeholder="Filter by category"
            />
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "available", label: "Available" },
                { value: "unavailable", label: "Unavailable" },
              ]}
              value={filters.availability}
              onChange={(value) => handleFilterChange("availability", value)}
              placeholder="Filter by availability"
            />
            <Select
              options={[
                { value: "createdAt_desc", label: "Newest First" },
                { value: "createdAt_asc", label: "Oldest First" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "name_asc", label: "Name: A to Z" },
                { value: "name_desc", label: "Name: Z to A" },
              ]}
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split("_");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
              placeholder="Sort by"
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className={styles.tableCard}>
        <DataTable
          columns={columns}
          data={foods?.data || []}
          loading={isLoading}
          totalItems={foods?.total || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyMessage="No foods found. Add your first food item!"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Food Item"
        message={`Are you sure you want to delete "${selectedFood?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteFoodMutation.isPending}
      />
    </div>
  );
};

export default FoodList;

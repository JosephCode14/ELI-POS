import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../../assets/global/url";

const exportFile = () => {
  const handleExportPDF = async (end) => {
    try {
      const res = await axios.get(`${BASE_URL}/inventory/${end}`, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      window.open(url);
    } catch (error) {
      console.error(error);
    }
  };
  const handleExportExcel = async (end, fileName) => {
    try {
      const response = await axios.get(`${BASE_URL}/inventory/${end}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = (type) => {
    swal({
      title: "Choose Export Format",
      text: "Which format would you like to export?",
      buttons: {
        pdf: {
          text: "PDF",
          value: "pdf",
          className: "--pdf",
        },
        excel: {
          text: "Excel",
          value: "excel",
          className: "--excel",
        },
      },
    }).then((value) => {
      switch (value) {
        case "pdf":
          if (type == "outbound") {
            handleExportPDF("export-pdf-outbound");
          } else if (type == "inbound") {
            handleExportPDF("export-pdf-inbound");
          } else if (type == "inventory") {
            handleExportPDF("export-pdf-inventory-stocks");
          } else if (type == "counting") {
            handleExportPDF("export-pdf-counting");
          }
          break;
        case "excel":
          if (type == "outbound") {
            handleExportExcel("export-excel-outbound", "outbound.xlsx");
          } else if (type == "inbound") {
            handleExportExcel("export-excel-inbound", "inbound.xlsx");
          } else if (type == "inventory") {
            handleExportExcel(
              "export-excel-inventory-stocks",
              "inventory.xlsx"
            );
          } else if (type == "counting") {
            handleExportExcel("export-excel-counting", "counting.xlsx");
          }

          break;
        default:
          console.log("No export format selected");
      }
    });
  };
  return { handleExport };
};

export default exportFile;

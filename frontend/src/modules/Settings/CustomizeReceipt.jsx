import axios from "axios";
import React, { useEffect, useState } from "react";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import swal from "sweetalert";
import { FourSquare } from "react-loading-indicators";

function CustomizeReceipt({ authrztn }) {
  const [fiftyEight, setFiftyEight] = useState(true);
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [headerSettings, setHeaderSettings] = useState({
    name: "header",
    splitAbove: 1,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [nameSettings, setNameSettings] = useState({
    name: "customerName",
    splitAbove: 0,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "xxl",
    weight: "",
    alignment: "Middle",
  });

  const [emailSettings, setEmailSettings] = useState({
    name: "email",
    splitAbove: 0,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [titleSettings, setTitleSettings] = useState({
    name: "title",
    splitAbove: 1,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [dineSettings, setDineSettings] = useState({
    name: "dine",
    splitAbove: 1,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [bodySettings, setBodySettings] = useState({
    name: "body",
    splitAbove: 0,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [summarySettings, setSummarySettings] = useState({
    name: "summary",
    splitAbove: 1,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [billSettings, setBillSettings] = useState({
    name: "bill",
    splitAbove: 1,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "Middle",
  });

  const [remarksSettings, setRemarksSettings] = useState({
    name: "remarks",
    splitAbove: 0,
    splitBelow: 0,
    blankAbove: 0,
    blankBelow: 0,
    size: "medium",
    weight: "",
    alignment: "",
  });

  const [orders, setOrders] = useState([
    {
      qty: 1,
      desc: "Adobo",
      amount: 120.25,
    },
    {
      qty: 1,
      desc: "Crispy Pata",
      amount: 80.75,
    },
    {
      qty: 1,
      desc: "Siken Joy",
      amount: 150.25,
    },
  ]);

  const handleFetchReceipt = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/customize_receipt/fetchSettings`
      );
      setIsLoading(false);
      setHeaderSettings({
        name: "header",
        splitAbove: res.data[0].splitAbove || 1,
        splitBelow: res.data[0].splitBelow || 0,
        blankAbove: res.data[0].blankAbove || 0,
        blankBelow: res.data[0].blankBelow || 0,
        size: res.data[0].size || "medium",
        weight: res.data[0].weight || "",
        alignment: res.data[0].alignment || "Middle",
      });

      setNameSettings({
        name: "customerName",
        splitAbove: res.data[1].splitAbove,
        splitBelow: res.data[1].splitBelow,
        blankAbove: res.data[1].blankAbove,
        blankBelow: res.data[1].blankBelow,
        size: res.data[1].size,
        weight: res.data[1].weight,
        alignment: res.data[1].alignment,
      });

      setEmailSettings({
        name: "email",
        splitAbove: res.data[2].splitAbove,
        splitBelow: res.data[2].splitBelow,
        blankAbove: res.data[2].blankAbove,
        blankBelow: res.data[2].blankBelow,
        size: res.data[2].size,
        weight: res.data[2].weight,
        alignment: res.data[2].alignment,
      });

      setTitleSettings({
        name: "title",
        splitAbove: res.data[3].splitAbove,
        splitBelow: res.data[3].splitBelow,
        blankAbove: res.data[3].blankAbove,
        blankBelow: res.data[3].blankBelow,
        size: res.data[3].size,
        weight: res.data[3].weight,
        alignment: res.data[3].alignment,
      });

      setDineSettings({
        name: "dine",
        splitAbove: res.data[4].splitAbove,
        splitBelow: res.data[4].splitBelow,
        blankAbove: res.data[4].blankAbove,
        blankBelow: res.data[4].blankBelow,
        size: res.data[4].size,
        weight: res.data[4].weight,
        alignment: res.data[4].alignment,
      });

      setBodySettings({
        name: "body",
        splitAbove: res.data[5].splitAbove,
        splitBelow: res.data[5].splitBelow,
        blankAbove: res.data[5].blankAbove,
        blankBelow: res.data[5].blankBelow,
        size: res.data[5].size,
        weight: res.data[5].weight,
        alignment: res.data[5].alignment,
      });

      setSummarySettings({
        name: "summary",
        splitAbove: res.data[6].splitAbove,
        splitBelow: res.data[6].splitBelow,
        blankAbove: res.data[6].blankAbove,
        blankBelow: res.data[6].blankBelow,
        size: res.data[6].size,
        weight: res.data[6].weight,
        alignment: res.data[6].alignment,
      });

      setBillSettings({
        name: "bill",
        splitAbove: res.data[7].splitAbove,
        splitBelow: res.data[7].splitBelow,
        blankAbove: res.data[7].blankAbove,
        blankBelow: res.data[7].blankBelow,
        size: res.data[7].size,
        weight: res.data[7].weight,
        alignment: res.data[7].alignment,
      });

      setRemarksSettings({
        name: "remarks",
        splitAbove: res.data[8].splitAbove,
        splitBelow: res.data[8].splitBelow,
        blankAbove: res.data[8].blankAbove,
        blankBelow: res.data[8].blankBelow,
        size: res.data[8].size,
        weight: res.data[8].weight,
        alignment: res.data[8].alignment,
      });
    } catch (error) {
      // console.error(error);
      // setIsLoading(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchReceipt();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCancelCustomize = () => {
    setSelected("");
  };

  const handleSaveReceipt = async () => {
    const receiptData = [
      headerSettings,
      nameSettings,
      emailSettings,
      titleSettings,
      dineSettings,
      bodySettings,
      summarySettings,
      billSettings,
      remarksSettings,
    ];
    const res = await axios.put(`${BASE_URL}/customize_receipt/customize`, {
      receiptData,
    });

    if (res.status == 200) {
      swal({
        title: "Receipt Customization Saved!",
        icon: "success",
        button: "OK",
      }).then(() => {
        handleFetchReceipt();
      });
    }
  };

  const handleAddSplitAbove = () => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    }
  };
  const handleAddSplitBelow = () => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        splitAbove: prevSettings.splitAbove + 1,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        splitBelow: prevSettings.splitBelow + 1,
      }));
    }
  };

  const handleReduceSplitAbove = () => {
    if (selected === "header") {
      if (headerSettings.splitAbove > 0) {
        setHeaderSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "name") {
      if (nameSettings.splitAbove > 0) {
        setNameSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "title") {
      if (titleSettings.splitAbove > 0) {
        setTitleSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "email") {
      if (emailSettings.splitAbove > 0) {
        setEmailSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "dine-in") {
      if (dineSettings.splitAbove > 0) {
        setDineSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "body") {
      if (bodySettings.splitAbove > 0) {
        setBodySettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "summary") {
      if (summarySettings.splitAbove > 0) {
        setSummarySettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "bill") {
      if (billSettings.splitAbove > 0) {
        setBillSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    } else if (selected === "remarks") {
      if (remarksSettings.splitAbove > 0) {
        setRemarksSettings((prevSettings) => ({
          ...prevSettings,
          splitAbove: prevSettings.splitAbove - 1,
        }));
      }
    }
  };

  const handleReduceSplitBelow = () => {
    if (selected === "header") {
      if (headerSettings.splitBelow > 0) {
        setHeaderSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "name") {
      if (nameSettings.splitBelow > 0) {
        setNameSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "email") {
      if (emailSettings.splitBelow > 0) {
        setEmailSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "title") {
      if (titleSettings.splitBelow > 0) {
        setTitleSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "dine-in") {
      if (dineSettings.splitBelow > 0) {
        setDineSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "body") {
      if (bodySettings.splitBelow > 0) {
        setBodySettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "summary") {
      if (summarySettings.splitBelow > 0) {
        setSummarySettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "bill") {
      if (billSettings.splitBelow > 0) {
        setBillSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    } else if (selected === "remarks") {
      if (remarksSettings.splitBelow > 0) {
        setRemarksSettings((prevSettings) => ({
          ...prevSettings,
          splitBelow: prevSettings.splitBelow - 1,
        }));
      }
    }
  };

  const handleAddBlankAbove = () => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    }
  };

  const handleAddBlankBelow = () => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        blankAbove: prevSettings.blankAbove + 1,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        blankBelow: prevSettings.blankBelow + 1,
      }));
    }
  };

  const handleReduceBlankAbove = () => {
    if (selected === "header") {
      if (headerSettings.blankAbove > 0) {
        setHeaderSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "name") {
      if (nameSettings.blankAbove > 0) {
        setNameSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "title") {
      if (titleSettings.blankAbove > 0) {
        setTitleSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "email") {
      if (emailSettings.blankAbove > 0) {
        setEmailSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "dine-in") {
      if (dineSettings.blankAbove > 0) {
        setDineSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "body") {
      if (bodySettings.blankAbove > 0) {
        setBodySettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "summary") {
      if (summarySettings.blankAbove > 0) {
        setSummarySettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "bill") {
      if (billSettings.blankAbove > 0) {
        setBillSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    } else if (selected === "remarks") {
      if (remarksSettings.blankAbove > 0) {
        setRemarksSettings((prevSettings) => ({
          ...prevSettings,
          blankAbove: prevSettings.blankAbove - 1,
        }));
      }
    }
  };

  const handleReduceBlankBelow = () => {
    if (selected === "header") {
      if (headerSettings.blankBelow > 0) {
        setHeaderSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "name") {
      if (nameSettings.blankBelow > 0) {
        setNameSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "email") {
      if (emailSettings.blankBelow > 0) {
        setEmailSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "title") {
      if (titleSettings.blankBelow > 0) {
        setTitleSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "dine-in") {
      if (dineSettings.blankBelow > 0) {
        setDineSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "body") {
      if (bodySettings.blankBelow > 0) {
        setBodySettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "summary") {
      if (summarySettings.blankBelow > 0) {
        setSummarySettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "bill") {
      if (billSettings.blankBelow > 0) {
        setBillSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    } else if (selected === "remarks") {
      if (remarksSettings.blankBelow > 0) {
        setRemarksSettings((prevSettings) => ({
          ...prevSettings,
          blankBelow: prevSettings.blankBelow - 1,
        }));
      }
    }
  };

  const handleAlignmentChange = (align) => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        alignment: align,
      }));
    }
  };
  const handleWeightChange = (weight) => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        weight: weight,
      }));
    }
  };
  const handleSizeChange = (size) => {
    if (selected === "header") {
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "name") {
      setNameSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "title") {
      setTitleSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "email") {
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "dine-in") {
      setDineSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "body") {
      setBodySettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "summary") {
      setSummarySettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "bill") {
      setBillSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    } else if (selected === "remarks") {
      setRemarksSettings((prevSettings) => ({
        ...prevSettings,
        size: size,
      }));
    }
  };

  const handleSelected = (selected) => {
    setSelected(selected);
  };
  const settings =
    selected === "header"
      ? headerSettings
      : selected === "name"
      ? nameSettings
      : selected === "email"
      ? emailSettings
      : selected === "title"
      ? titleSettings
      : selected == "dine-in"
      ? dineSettings
      : selected == "bill"
      ? billSettings
      : selected == "summary"
      ? summarySettings
      : selected == "body"
      ? bodySettings
      : selected == "remarks"
      ? remarksSettings
      : {};

  // To Fetch the selected weight or size
  const boldChecked = settings.weight == "Bold";
  const regularCheck = settings.weight != "Bold";
  const leftCheck = settings.alignment == "Left";
  const rightCheck = settings.alignment == "Right";
  const middleCheck = settings.alignment == "Middle";
  const smallCheck = settings.size == "small";
  const mediumCheck = settings.size == "medium";
  const largeCheck = settings.size == "large";
  const xlCheck = settings.size == "xl";
  const xxlCheck = settings.size == "xxl";

  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          style={{ margin: "0", marginLeft: "250px", marginTop: "20%" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("CustomizationReceipt-View") ? (
        <div className="customize-receipt-container">
          <div className="receipt-container">
            <div className="receipt-head-container">
              <div className="receipt-type-container">
                <h2>Receipt Type:</h2>
                <select
                  className="form-select select-loyalty m-0"
                  aria-label="Default select example"
                >
                  <option value="Customer Display" disabled>
                    Select Receipt Type
                  </option>
                  <option value="dine-in">Dine-in order receipt</option>
                  <option value="take-out">Take-out order receipt</option>
                </select>
              </div>
              <div className="millimeter-container">
                <h4
                  onClick={() => setFiftyEight(true)}
                  className={`${fiftyEight ? "selectedSize" : ""}`}
                >
                  58mm
                </h4>
                <h4
                  onClick={() => setFiftyEight(false)}
                  className={`${!fiftyEight ? "selectedSize" : ""}`}
                >
                  80mm
                </h4>
              </div>
            </div>

            <div className="paper-container">
              <div
                className={`receipt ${
                  fiftyEight ? "receipt-fifty" : "receipt-eighty"
                }`}
              >
                {/* <div className="receipt-title"> */}

                {nameSettings.splitAbove > 0 &&
                  [...Array(nameSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {nameSettings.blankAbove > 0 &&
                  [...Array(nameSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`receipt-title-name ${
                    selected === "name" ? "cust-selected" : ""
                  } ${
                    nameSettings.alignment === "Left"
                      ? "cust-left"
                      : nameSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${nameSettings.weight == "Bold" ? "cust-bold" : ""} 
                ${
                  nameSettings.size == "small"
                    ? "cust-small"
                    : nameSettings.size == "medium"
                    ? "cust-med"
                    : nameSettings.size == "large"
                    ? "cust-large"
                    : nameSettings.size == "xl"
                    ? "cust-xl"
                    : "cust-xxl"
                }
                `}
                  onClick={() => handleSelected("name")}
                >
                  {/* <h3 className={`cust-text `}>BUON TAVOLO</h3> */}
                  <p className="cust-text">JOHN DOE</p>
                  <div
                    className={`receipt-arrow title-name ${
                      selected === "name" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("name")}
                  >
                    <div className="arrow-title ">Name</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {nameSettings.splitBelow > 0 &&
                  [...Array(nameSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {nameSettings.blankBelow > 0 &&
                  [...Array(nameSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {emailSettings.splitAbove > 0 &&
                  [...Array(emailSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {emailSettings.blankAbove > 0 &&
                  [...Array(emailSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`receipt-title-email ${
                    selected === "email" ? "cust-selected" : ""
                  }  ${
                    emailSettings.alignment === "Left"
                      ? "cust-left"
                      : emailSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${emailSettings.weight == "Bold" ? "cust-bold" : ""}  ${
                    emailSettings.size == "small"
                      ? "cust-small"
                      : emailSettings.size == "medium"
                      ? "cust-med"
                      : emailSettings.size == "large"
                      ? "cust-large"
                      : emailSettings.size == "xl"
                      ? "cust-xl"
                      : emailSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  onClick={() => handleSelected("email")}
                >
                  {/* <h4 className={`cust-text`}>buontavolo@gmail.com</h4> */}
                  <p className="cust-text">example@gmail.com</p>
                  <div
                    className={`receipt-arrow title-email ${
                      selected === "email" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("email")}
                  >
                    <div className="arrow-title">Email</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {emailSettings.splitBelow > 0 &&
                  [...Array(emailSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {emailSettings.blankBelow > 0 &&
                  [...Array(emailSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {/* </div> */}
                {titleSettings.splitAbove > 0 &&
                  [...Array(titleSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {titleSettings.blankAbove > 0 &&
                  [...Array(titleSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`title-billing ${
                    selected === "title" ? "cust-selected" : ""
                  } ${
                    titleSettings.alignment === "Left"
                      ? "cust-left"
                      : titleSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${titleSettings.weight == "Bold" ? "cust-bold" : ""} ${
                    titleSettings.size == "small"
                      ? "cust-small"
                      : titleSettings.size == "medium"
                      ? "cust-med"
                      : titleSettings.size == "large"
                      ? "cust-large"
                      : titleSettings.size == "xl"
                      ? "cust-xl"
                      : titleSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  onClick={() => handleSelected("title")}
                >
                  <p className="cust-text"> BILLING</p>
                  <div
                    className={`receipt-arrow with-btm ${
                      selected === "title" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("title")}
                  >
                    <div className="arrow-title">Title</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {titleSettings.splitBelow > 0 &&
                  [...Array(titleSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {titleSettings.blankBelow > 0 &&
                  [...Array(titleSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {headerSettings.splitAbove > 0 &&
                  [...Array(headerSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {headerSettings.blankAbove > 0 &&
                  [...Array(headerSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}

                <div
                  className={`receipt-order-header ${
                    selected === "header" ? "cust-selected" : ""
                  } ${
                    headerSettings.alignment === "Left"
                      ? "cust-left"
                      : headerSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${headerSettings.weight == "Bold" ? "cust-bold" : ""} ${
                    headerSettings.size == "small"
                      ? "cust-small"
                      : headerSettings.size == "medium"
                      ? "cust-med"
                      : headerSettings.size == "large"
                      ? "cust-large"
                      : headerSettings.size == "xl"
                      ? "cust-xl"
                      : headerSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  onClick={() => handleSelected("header")}
                >
                  <p className="cust-text">Qty</p>
                  <p className="cust-text">Description</p>
                  <p className="cust-text">Amount</p>
                  <div
                    className={`receipt-arrow with-btm ${
                      selected === "header" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("header")}
                  >
                    <div className="arrow-title">Header</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {headerSettings.splitBelow > 0 &&
                  [...Array(headerSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {headerSettings.blankBelow > 0 &&
                  [...Array(headerSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {/* Dine In  */}
                {dineSettings.splitAbove > 0 &&
                  [...Array(dineSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {dineSettings.blankAbove > 0 &&
                  [...Array(dineSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`type-order-container ${
                    selected === "dine-in" ? "cust-selected" : ""
                  }  ${
                    dineSettings.alignment === "Left"
                      ? "cust-left"
                      : dineSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${dineSettings.weight == "Bold" ? "cust-bold" : ""} ${
                    dineSettings.size == "small"
                      ? "cust-small"
                      : dineSettings.size == "medium"
                      ? "cust-med"
                      : dineSettings.size == "large"
                      ? "cust-large"
                      : dineSettings.size == "xl"
                      ? "cust-xl"
                      : dineSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  onClick={() => handleSelected("dine-in")}
                >
                  <p>Dine In</p>
                  <div
                    className={`receipt-arrow with-btm ${
                      selected === "dine-in" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("dine-in")}
                  >
                    <div className="arrow-title">Order Type</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {dineSettings.splitBelow > 0 &&
                  [...Array(dineSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {dineSettings.blankBelow > 0 &&
                  [...Array(dineSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {/* Body */}
                {bodySettings.splitAbove > 0 &&
                  [...Array(bodySettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {bodySettings.blankAbove > 0 &&
                  [...Array(bodySettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`receipt-order-body ${
                    selected === "body" ? "cust-selected" : ""
                  }  ${
                    bodySettings.alignment === "Left"
                      ? "cust-left"
                      : bodySettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  }  ${bodySettings.weight == "Bold" ? "cust-bold" : ""} ${
                    bodySettings.size == "small"
                      ? "cust-small"
                      : bodySettings.size == "medium"
                      ? "cust-med"
                      : bodySettings.size == "large"
                      ? "cust-large"
                      : bodySettings.size == "xl"
                      ? "cust-xl"
                      : bodySettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  onClick={() => handleSelected("body")}
                >
                  {orders.map((order) => (
                    <>
                      <div className="receipt-orders">
                        <p>{order.qty}</p>
                        <p>{order.desc}</p>
                        <p>{order.amount}</p>
                      </div>
                    </>
                  ))}
                  <div
                    className={`receipt-arrow with-tp ${
                      selected === "body" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("body")}
                  >
                    <div className="arrow-title">Product Info</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {bodySettings.splitBelow > 0 &&
                  [...Array(bodySettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {bodySettings.blankBelow > 0 &&
                  [...Array(bodySettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {/* Summary */}
                {summarySettings.splitAbove > 0 &&
                  [...Array(summarySettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {summarySettings.blankAbove > 0 &&
                  [...Array(summarySettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`total-summary-container ${
                    selected === "summary" ? "cust-selected" : ""
                  }  ${
                    summarySettings.alignment === "Left"
                      ? "cust-left"
                      : summarySettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${summarySettings.weight == "Bold" ? "cust-bold" : ""} 
                ${
                  summarySettings.size == "small"
                    ? "cust-small"
                    : summarySettings.size == "medium"
                    ? "cust-med"
                    : summarySettings.size == "large"
                    ? "cust-large"
                    : summarySettings.size == "xl"
                    ? "cust-xl"
                    : summarySettings.size == "xxl"
                    ? "cust-xxl"
                    : ""
                }
                `}
                  onClick={() => handleSelected("summary")}
                >
                  <div className="summary-container">
                    <p>TOTAL </p>
                    <p>350.00</p>
                  </div>

                  <div className="summary-container">
                    <p>TAP CARD</p>
                    <p>350.00</p>
                  </div>
                  <div className="summary-container">
                    <p>Amount Tendered</p>
                    <p>350.00</p>
                  </div>
                  <div className="summary-container">
                    <p>CHANGE</p>
                    <p>0</p>
                  </div>
                  <div
                    className={`receipt-arrow with-tp ${
                      selected === "summary" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("summary")}
                  >
                    <div className="arrow-title">Order Amount</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {summarySettings.splitBelow > 0 &&
                  [...Array(summarySettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {summarySettings.blankBelow > 0 &&
                  [...Array(summarySettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {billSettings.splitAbove > 0 &&
                  [...Array(billSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {billSettings.blankAbove > 0 &&
                  [...Array(billSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`bill-details-container ${
                    selected === "bill" ? "cust-selected" : ""
                  } ${billSettings.weight == "Bold" ? "cust-bold" : ""}   ${
                    billSettings.size == "small"
                      ? "cust-small"
                      : billSettings.size == "medium"
                      ? "cust-med"
                      : billSettings.size == "large"
                      ? "cust-large"
                      : billSettings.size == "xl"
                      ? "cust-xl"
                      : billSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  } `}
                  onClick={() => handleSelected("bill")}
                >
                  <div className="summary-container">
                    <p>Bill No. </p>
                    <p>00042444</p>
                  </div>

                  <div className="summary-container">
                    <p>Transaction No.</p>
                    <p>00042444</p>
                  </div>
                  <div className="summary-container">
                    <p>Terminal:</p>
                    <p>Cashiering 1</p>
                  </div>
                  <div className="summary-container">
                    <p>Cashier:</p>
                    <p>John Doe</p>
                  </div>
                  <div className="summary-container">
                    <p>Trans. Date:</p>
                    <p>2024-02-26 12:54</p>
                  </div>
                  <div className="summary-container">
                    <p>ID No.:</p>
                    <p>C-0906-02</p>
                  </div>
                  <div className="summary-container">
                    <p>Name:</p>
                    <p>John Doe</p>
                  </div>
                  <div className="summary-container">
                    <p>Initial Balance:</p>
                    <p>288.00</p>
                  </div>
                  <div className="summary-container">
                    <p>Remaining Balance:</p>
                    <p>193.00</p>
                  </div>
                  <div
                    className={`receipt-arrow ${
                      selected === "bill" ? "arr-selected" : ""
                    }`}
                    onClick={() => handleSelected("bill")}
                  >
                    <div className="arrow-title">Order Summary</div>
                    <i class="bx bx-caret-right"></i>
                  </div>
                </div>
                {billSettings.splitBelow > 0 &&
                  [...Array(billSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {billSettings.blankBelow > 0 &&
                  [...Array(billSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                {remarksSettings.splitAbove > 0 &&
                  [...Array(remarksSettings.splitAbove)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {remarksSettings.blankAbove > 0 &&
                  [...Array(remarksSettings.blankAbove)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
                <div
                  className={`disclaimer-container ${
                    selected === "remarks" ? "cust-selected" : ""
                  }  ${
                    remarksSettings.alignment === "Left"
                      ? "cust-left"
                      : remarksSettings.alignment === "Right"
                      ? "cust-right"
                      : ""
                  } ${remarksSettings.weight == "Bold" ? "cust-bold" : ""}  ${
                    remarksSettings.size == "small"
                      ? "cust-small"
                      : remarksSettings.size == "medium"
                      ? "cust-med"
                      : remarksSettings.size == "large"
                      ? "cust-large"
                      : remarksSettings.size == "xl"
                      ? "cust-xl"
                      : remarksSettings.size == "xxl"
                      ? "cust-xxl"
                      : ""
                  }`}
                  // onClick={() => handleSelected("remarks")}
                >
                  {/* <p>
                  This document is not valid <br /> For claim of input tax
                </p> */}
                  <h6 className="receipt-foodstab receipt-fs1">FOOD STAB</h6>
                  <div className="foodstab-n-date">
                    <h1>#0001</h1>
                    <p>2024-06-24</p>
                  </div>

                  <h6 className="receipt-foodstab receipt-fs2">FOOD STAB</h6>
                  {/* <div
                  className={`receipt-arrow ${
                    selected === "remarks" ? "arr-selected" : ""
                  } `}
                  onClick={() => handleSelected("remarks")}
                >
                  <div className="arrow-title">Remarks</div>
                  <i class="bx bx-caret-right"></i>
                </div> */}
                </div>
                {remarksSettings.splitBelow > 0 &&
                  [...Array(remarksSettings.splitBelow)].map((_, index) => (
                    <div key={index} className="dashed-receipt"></div>
                  ))}
                {remarksSettings.blankBelow > 0 &&
                  [...Array(remarksSettings.blankBelow)].map((_, index) => (
                    <div key={index} className="cust-blank-line"></div>
                  ))}
              </div>
            </div>
          </div>
          {selected != "" ? (
            <>
              <div className="customization-container">
                <div className="customization-title-container">
                  <h2>Print Contents:</h2>
                </div>
                {/* Alignment */}
                {selected != "remarks" &&
                selected != "bill" &&
                selected != "summary" &&
                selected != "body" &&
                selected != "header" ? (
                  <>
                    <div className="alignment-container">
                      <h3>Alignment: </h3>
                      <form>
                        <div className="radio-alignment-container">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="left"
                              onChange={() => handleAlignmentChange("Left")}
                              checked={leftCheck}
                            />
                            <label for="left">Left</label>
                          </div>
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="middle"
                              onChange={() => handleAlignmentChange("Middle")}
                              checked={middleCheck}
                            />
                            <label for="middle">Middle</label>
                          </div>
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="right"
                              onChange={() => handleAlignmentChange("Right")}
                              checked={rightCheck}
                            />
                            <label for="right">Right</label>
                          </div>
                        </div>
                      </form>
                    </div>
                  </>
                ) : null}

                {/* Font Weight */}

                <div className="alignment-container">
                  <h3>Weight: </h3>
                  <form>
                    <div className="radio-alignment-container">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="bold"
                          onChange={() => handleWeightChange("Bold")}
                          checked={boldChecked}
                        />
                        <label for="bold">Bold</label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="regular"
                          onChange={() => handleWeightChange("Regular")}
                          checked={regularCheck}
                        />
                        <label for="regular">Regular</label>
                      </div>
                    </div>
                  </form>
                </div>
                {/* Sizes */}
                <div className="alignment-container">
                  <h3>Size: </h3>
                  <form>
                    <div className="radio-alignment-container">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="small"
                          onChange={() => handleSizeChange("small")}
                          checked={smallCheck}
                        />
                        <label for="small">S</label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="medium"
                          onChange={() => handleSizeChange("medium")}
                          checked={mediumCheck}
                        />
                        <label for="medium">M</label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="large"
                          onChange={() => handleSizeChange("large")}
                          checked={largeCheck}
                        />
                        <label for="large">L</label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="xtra"
                          onChange={() => handleSizeChange("xl")}
                          checked={xlCheck}
                        />
                        <label for="xtra">XL</label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="flexRadioDefault"
                          id="xxl"
                          onChange={() => handleSizeChange("xxl")}
                          checked={xxlCheck}
                        />
                        <label for="xxl">XXL</label>
                      </div>
                    </div>
                  </form>
                </div>
                {/* Split Line */}
                <div className="add-sub-container">
                  <h3 className="add-sub-title">Split Line: </h3>
                  <div className="add-sub-btn">
                    <button onClick={handleAddSplitAbove}>+</button>
                    <h3>Add Above</h3>
                    <button onClick={handleReduceSplitAbove}>-</button>
                  </div>
                  <div className="add-sub-btn">
                    <button onClick={handleAddSplitBelow}>+</button>
                    <h3>Add Below</h3>
                    <button onClick={handleReduceSplitBelow}>-</button>
                  </div>
                </div>
                {/* Blank Line */}
                <div className="add-sub-container blank-container">
                  <h3 className="add-sub-title">Blank Line: </h3>
                  <div className="add-sub-btn">
                    <button onClick={handleAddBlankAbove}>+</button>
                    <h3>Add Above</h3>
                    <button onClick={handleReduceBlankAbove}>-</button>
                  </div>
                  <div className="add-sub-btn mb-5">
                    <button onClick={handleAddBlankBelow}>+</button>
                    <h3>Add Below</h3>
                    <button onClick={handleReduceBlankBelow}>-</button>
                  </div>
                </div>

                <div className="customize-receipt-btn nfc-button-container ">
                  <button
                    onClick={handleCancelCustomize}
                    className="load-c-button load-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="load-l-button load-btn"
                    onClick={handleSaveReceipt}
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="customization-container"></div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}
    </>
  );
}

export default CustomizeReceipt;
